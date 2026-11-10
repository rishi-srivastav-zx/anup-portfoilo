import { pool } from "../config/db.js";
import { parseCsv } from "../utils/csvParser.js";
import { sanitizeHtml } from "../utils/htmlSanitizer.js";
import { blogImportItemSchema } from "../validators/blogImport.validator.js";
import { blogQueueRepository } from "../repositories/blogQueue.repository.js";

/**
 * In-Memory Idempotency Store (10-minute TTL, LRU bounded to 1000 keys)
 * 
 * ARCHITECTURAL SECURITY NOTE:
 * This in-memory store prevents rapid accidental resubmissions on a single Node process.
 * In a distributed, horizontally-scaled multi-container / serverless environment,
 * requests with the same Idempotency-Key hitting separate container instances
 * would not share memory. For multi-instance high-availability deployments,
 * migrate this map to a shared Redis cluster or an `idempotency_keys` table in PostgreSQL.
 */
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const MAX_IDEMPOTENCY_KEYS = 1000;

const slugify = (str = "") =>
    String(str)
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 200);

const calcReadingTime = (text = "") => {
    const words = text.split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

export const blogImportService = {
    /**
     * Cleans up expired idempotency keys
     */
    cleanIdempotencyCache() {
        const now = Date.now();
        for (const [key, entry] of idempotencyCache.entries()) {
            if (entry.exp < now) idempotencyCache.delete(key);
        }
    },

    /**
     * Parses uploaded buffer or raw string into an array of blog objects
     */
    parseInput(input, { mimetype = "", filename = "" } = {}) {
        let text = "";
        if (Buffer.isBuffer(input)) {
            text = input.toString("utf-8");
        } else if (typeof input === "string") {
            text = input;
        } else if (Array.isArray(input)) {
            // Already parsed JSON array
            return input.map((item, index) => ({ ...item, _rowNumber: index + 1 }));
        } else if (input && typeof input === "object" && Array.isArray(input.blogs)) {
            return input.blogs.map((item, index) => ({ ...item, _rowNumber: index + 1 }));
        } else {
            throw new Error("Invalid payload format. Expected JSON array or CSV text.");
        }

        const isCsv =
            mimetype.includes("csv") ||
            filename.endsWith(".csv") ||
            (!text.trim().startsWith("[") && !text.trim().startsWith("{"));

        if (isCsv) {
            try {
                return parseCsv(text);
            } catch (err) {
                throw new Error(`CSV Parsing Failed: ${err.message}`);
            }
        } else {
            try {
                const parsed = JSON.parse(text);
                const array = Array.isArray(parsed)
                    ? parsed
                    : Array.isArray(parsed.blogs)
                      ? parsed.blogs
                      : [parsed];
                return array.map((item, index) => ({ ...item, _rowNumber: index + 1 }));
            } catch (err) {
                throw new Error(`Malformed JSON: ${err.message}`);
            }
        }
    },

    /**
     * Validates and sanitizes raw import records, identifying conflicts and errors
     */
    async validateAndPrepareRecords(records, { autoDisambiguateSlugs = false } = {}) {
        const errors = [];
        const validatedRecords = [];
        const seenSlugs = new Map(); // slug -> rowNumber

        // 1. First pass: format, schema validation & internal in-batch duplicate check
        for (let i = 0; i < records.length; i++) {
            const raw = records[i];
            const rowNumber = raw._rowNumber || i + 1;

            // Generate slug if omitted
            let targetSlug = raw.slug ? String(raw.slug).trim() : slugify(raw.title);
            if (!targetSlug && raw.title) {
                targetSlug = slugify(raw.title);
            }

            // In-batch duplicate check
            if (targetSlug) {
                if (seenSlugs.has(targetSlug)) {
                    const firstSeenRow = seenSlugs.get(targetSlug);
                    errors.push({
                        row: rowNumber,
                        slug: targetSlug,
                        field: "slug",
                        message: `Duplicate slug "${targetSlug}" detected within upload batch (first seen at row ${firstSeenRow}).`,
                    });
                } else {
                    seenSlugs.set(targetSlug, rowNumber);
                }
            }

            // Zod validation
            const parsedZod = blogImportItemSchema.safeParse({
                ...raw,
                slug: targetSlug || undefined,
            });

            if (!parsedZod.success) {
                for (const issue of parsedZod.error.issues) {
                    errors.push({
                        row: rowNumber,
                        slug: targetSlug || "unknown",
                        field: issue.path.join(".") || "record",
                        message: issue.message,
                    });
                }
                continue;
            }

            const data = parsedZod.data;

            // HTML sanitization for rich text fields (preserving original editorial content intact)
            data.content = sanitizeHtml(data.content || "");
            data.excerpt = sanitizeHtml(data.excerpt || "");
            if (data.technicalNote) {
                data.technicalNote = sanitizeHtml(data.technicalNote);
            }

            // Auto-calculate reading time if missing
            if (!data.readingTime) {
                data.readingTime = calcReadingTime(data.content + " " + data.excerpt);
            }

            // Fallback SEO fields if missing
            if (!data.seoTitle) {
                data.seoTitle = `${data.title} | Anup Rawat`.slice(0, 255);
            }
            if (!data.seoDescription) {
                data.seoDescription = (data.excerpt || data.title).slice(0, 300);
            }
            if (!data.canonicalUrl && data.slug) {
                data.canonicalUrl = `https://anuprawat.com/blog/${data.slug}`;
            }

            validatedRecords.push({
                ...data,
                _rowNumber: rowNumber,
            });
        }

        // 2. Second pass: Database conflict check against existing blogs table
        const candidateSlugs = validatedRecords
            .map((r) => r.slug)
            .filter(Boolean);

        const conflictedRows = new Set();
        if (candidateSlugs.length > 0) {
            const existingSlugs = await blogQueueRepository.findExistingSlugs(candidateSlugs);
            const existingSlugSet = new Set(existingSlugs);

            for (const record of validatedRecords) {
                if (existingSlugSet.has(record.slug)) {
                    if (autoDisambiguateSlugs) {
                        record.slug = `${record.slug}-${Date.now().toString(36).slice(-4)}`;
                    } else {
                        conflictedRows.add(record._rowNumber);
                        errors.push({
                            row: record._rowNumber,
                            slug: record.slug,
                            field: "slug",
                            message: `Slug "${record.slug}" already exists in blogs database. Existing blog content is protected and cannot be overwritten.`,
                        });
                    }
                }
            }
        }

        const validRecords = validatedRecords.filter((r) => !conflictedRows.has(r._rowNumber));

        return {
            records: validRecords,
            errors,
            validCount: validRecords.length,
            invalidCount: errors.length,
            totalCount: records.length,
        };
    },

    /**
     * Preview mode: Validates and formats records without saving to database
     */
    async previewImport(input, options = {}) {
        const rawRecords = this.parseInput(input, options);
        if (rawRecords.length === 0) {
            throw new Error("No blog records found to preview.");
        }

        const validation = await this.validateAndPrepareRecords(rawRecords, options);
        const sampleSize = Math.min(5, validation.records.length);
        const preview = validation.records.slice(0, sampleSize).map((r) => ({
            row: r._rowNumber,
            title: r.title,
            slug: r.slug,
            category: r.category,
            tags: r.tags,
            readingTime: r.readingTime,
            excerpt: r.excerpt ? r.excerpt.slice(0, 120) + "..." : "",
            contentLength: r.content ? r.content.length : 0,
            hasFeaturedImage: Boolean(r.featuredImage),
        }));

        return {
            success: true,
            totalCount: validation.totalCount,
            validCount: validation.validCount,
            invalidCount: validation.invalidCount,
            errors: validation.errors,
            preview,
        };
    },

    /**
     * Execution mode: Inserts blogs as drafts and enqueues them for scheduled publishing
     */
    async executeImport(input, options = {}, { userId = null, idempotencyKey = null } = {}) {
        // Idempotency check
        if (idempotencyKey) {
            this.cleanIdempotencyCache();
            const cached = idempotencyCache.get(idempotencyKey);
            if (cached && cached.exp > Date.now()) {
                return {
                    ...cached.result,
                    _idempotentReplay: true,
                };
            }
        }

        const rawRecords = this.parseInput(input, options);
        if (rawRecords.length === 0) {
            throw new Error("No blog records found to import.");
        }

        const validation = await this.validateAndPrepareRecords(rawRecords, options);

        // If partial import is NOT allowed and there are errors, fail immediately
        if (!options.allowPartial && validation.errors.length > 0) {
            return {
                success: false,
                message: `Bulk import validation failed with ${validation.errors.length} error(s). Set allowPartial=true to skip invalid rows.`,
                totalProcessed: validation.totalCount,
                importedCount: 0,
                failedCount: validation.errors.length,
                errors: validation.errors,
            };
        }

        // Filter valid records (exclude rows that caused errors)
        const errorRows = new Set(validation.errors.map((e) => e.row));
        const recordsToInsert = validation.records.filter((r) => !errorRows.has(r._rowNumber));

        if (recordsToInsert.length === 0) {
            return {
                success: false,
                message: "No valid blog records available for import after validation.",
                totalProcessed: validation.totalCount,
                importedCount: 0,
                failedCount: validation.errors.length,
                errors: validation.errors,
            };
        }

        // Retrieve scheduler settings for interval calculation (default: 360m / 6 hours)
        const settings = await blogQueueRepository.getSettings();
        const intervalMinutes = options.publishingIntervalMinutes || settings?.publishing_interval_minutes || 360;

        // Determine base schedule time:
        // Either explicitly requested start time, or after the latest scheduled queue job, or NOW() + interval
        let baseScheduleTime;
        if (options.startPublishAt) {
            baseScheduleTime = new Date(options.startPublishAt);
        } else {
            const latestQueueTime = await blogQueueRepository.getLatestScheduledTime();
            const now = new Date();
            if (latestQueueTime && latestQueueTime > now) {
                baseScheduleTime = new Date(latestQueueTime.getTime() + intervalMinutes * 60 * 1000);
            } else {
                baseScheduleTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
            }
        }

        // Execute transaction
        const client = await pool.connect();
        const importedBlogs = [];

        try {
            await client.query("BEGIN");

            for (let idx = 0; idx < recordsToInsert.length; idx++) {
                const record = recordsToInsert[idx];
                // Sequential spacing for each blog
                const scheduledAt = new Date(baseScheduleTime.getTime() + idx * intervalMinutes * 60 * 1000);

                const inserted = await blogQueueRepository.insertBlogAndQueue(
                    {
                        blogData: {
                            ...record,
                            userId,
                        },
                        queueData: {
                            scheduledAt,
                            createdBy: userId,
                            maxAttempts: 3,
                        },
                    },
                    client
                );

                importedBlogs.push({
                    blogId: inserted.blog.id,
                    queueId: inserted.queue.id,
                    title: inserted.blog.title,
                    slug: inserted.blog.slug,
                    status: inserted.blog.status, // always 'draft'
                    queueStatus: inserted.queue.status, // always 'pending'
                    scheduledAt: inserted.queue.scheduled_at,
                });
            }

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw new Error(`Database transaction failed during bulk blog insertion: ${err.message}`);
        } finally {
            client.release();
        }

        const result = {
            success: true,
            message: `Successfully imported and scheduled ${importedBlogs.length} blog(s).`,
            summary: {
                totalProcessed: validation.totalCount,
                importedCount: importedBlogs.length,
                failedCount: validation.errors.length,
                intervalMinutes,
                firstScheduledAt: importedBlogs[0]?.scheduledAt || null,
                lastScheduledAt: importedBlogs[importedBlogs.length - 1]?.scheduledAt || null,
            },
            importedBlogs,
            errors: validation.errors,
        };

        // Cache idempotency result if key was provided (with LRU eviction guard)
        if (idempotencyKey) {
            if (idempotencyCache.size >= MAX_IDEMPOTENCY_KEYS) {
                // Evict the oldest key
                const oldestKey = idempotencyCache.keys().next().value;
                if (oldestKey) idempotencyCache.delete(oldestKey);
            }
            idempotencyCache.set(idempotencyKey, {
                result,
                exp: Date.now() + IDEMPOTENCY_TTL_MS,
            });
        }

        return result;
    },
};

export default blogImportService;


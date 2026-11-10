/**
 * Production-Ready RFC-4180 Compliant CSV Parser
 * Handles multiline quoted strings, escaped quotes (""), varying line breaks (\r\n or \n),
 * and case-insensitive header normalization.
 */

/**
 * Parses raw CSV string into an array of tokenized rows.
 * @param {string} csvText 
 * @returns {Array<Array<string>>}
 */
export function tokenizeCsv(csvText) {
    if (typeof csvText !== "string" || !csvText.trim()) {
        return [];
    }

    const rows = [];
    let currentRow = [];
    let currentField = "";
    let inQuotes = false;
    let i = 0;
    const len = csvText.length;

    while (i < len) {
        const char = csvText[i];

        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote ("")
                if (i + 1 < len && csvText[i + 1] === '"') {
                    currentField += '"';
                    i += 2;
                    continue;
                } else {
                    // Closing quote
                    inQuotes = false;
                    i++;
                    continue;
                }
            } else {
                currentField += char;
                i++;
                continue;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
                i++;
                continue;
            } else if (char === ",") {
                currentRow.push(currentField);
                currentField = "";
                i++;
                continue;
            } else if (char === "\r") {
                // Check for \r\n
                if (i + 1 < len && csvText[i + 1] === "\n") {
                    i++;
                }
                currentRow.push(currentField);
                currentField = "";
                // Only push row if it contains at least one non-empty field or multiple fields
                if (currentRow.length > 1 || (currentRow[0] && currentRow[0].trim())) {
                    rows.push(currentRow);
                }
                currentRow = [];
                i++;
                continue;
            } else if (char === "\n") {
                currentRow.push(currentField);
                currentField = "";
                if (currentRow.length > 1 || (currentRow[0] && currentRow[0].trim())) {
                    rows.push(currentRow);
                }
                currentRow = [];
                i++;
                continue;
            } else {
                currentField += char;
                i++;
                continue;
            }
        }
    }

    // Push the final field and row if any remains
    if (inQuotes) {
        throw new Error("Malformed CSV: Unclosed quote detected at end of file.");
    }

    if (currentField !== "" || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.length > 1 || (currentRow[0] && currentRow[0].trim())) {
            rows.push(currentRow);
        }
    }

    return rows;
}

/**
 * Standardizes header names to camelCase for consistent object mapping.
 */
function normalizeHeaderName(header) {
    const clean = header.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const mapping = {
        title: "title",
        slug: "slug",
        excerpt: "excerpt",
        category: "category",
        tag: "tags",
        tags: "tags",
        author: "author",
        authorname: "authorName",
        author_name: "authorName",
        authorrole: "authorRole",
        author_role: "authorRole",
        featuredimage: "featuredImage",
        featured_image: "featuredImage",
        featuredimagealt: "featuredImageAlt",
        featured_image_alt: "featuredImageAlt",
        readingtime: "readingTime",
        reading_time: "readingTime",
        technicalnote: "technicalNote",
        technical_note: "technicalNote",
        content: "content",
        introduction: "introduction",
        sections: "sections",
        galleryimages: "galleryImages",
        gallery_images: "galleryImages",
        seotitle: "seoTitle",
        seo_title: "seoTitle",
        seodescription: "seoDescription",
        seo_description: "seoDescription",
        seokeywords: "seoKeywords",
        seo_keywords: "seoKeywords",
        canonicalurl: "canonicalUrl",
        canonical_url: "canonicalUrl",
        layoutvariant: "layoutVariant",
        layout_variant: "layoutVariant",
        isfeatured: "isFeatured",
        is_featured: "isFeatured",
        scheduledat: "scheduledAt",
        scheduled_at: "scheduledAt",
    };
    return mapping[clean] || header.trim();
}

/**
 * Parses a CSV string into an array of structured blog objects.
 * @param {string} csvText
 * @param {number} maxRecords
 * @returns {Array<object>}
 */
export function parseCsv(csvText, maxRecords = 500) {
    const rawRows = tokenizeCsv(csvText);
    if (rawRows.length === 0) {
        throw new Error("CSV file is empty.");
    }

    const rawHeaders = rawRows[0];
    if (!rawHeaders || rawHeaders.length === 0) {
        throw new Error("CSV must contain a header row.");
    }

    const headers = rawHeaders.map(normalizeHeaderName);
    const records = [];

    for (let r = 1; r < rawRows.length; r++) {
        if (records.length >= maxRecords) {
            break;
        }

        const rowValues = rawRows[r];
        // Skip completely empty rows
        if (rowValues.every((val) => !val || !val.trim())) {
            continue;
        }

        const obj = {
            _rowNumber: r + 1, // 1-based row number including header
        };

        for (let c = 0; c < headers.length; c++) {
            const key = headers[c];
            const val = rowValues[c] !== undefined ? rowValues[c].trim() : "";
            obj[key] = val;
        }

        // Post-process special columns:
        // Tags: if comma-separated or JSON array string
        if (typeof obj.tags === "string") {
            const rawTags = obj.tags.trim();
            if (rawTags.startsWith("[") && rawTags.endsWith("]")) {
                try {
                    obj.tags = JSON.parse(rawTags);
                } catch {
                    obj.tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
                }
            } else if (rawTags) {
                obj.tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
            } else {
                obj.tags = [];
            }
        }

        // Introduction: if JSON array string or multi-paragraph string
        if (typeof obj.introduction === "string") {
            const rawIntro = obj.introduction.trim();
            if (rawIntro.startsWith("[") && rawIntro.endsWith("]")) {
                try {
                    obj.introduction = JSON.parse(rawIntro);
                } catch {
                    obj.introduction = rawIntro ? [rawIntro] : [];
                }
            } else if (rawIntro) {
                obj.introduction = rawIntro.split("\n\n").map((p) => p.trim()).filter(Boolean);
            } else {
                obj.introduction = [];
            }
        }

        // Sections: if JSON array string
        if (typeof obj.sections === "string" && obj.sections.trim()) {
            const rawSec = obj.sections.trim();
            if (rawSec.startsWith("[") && rawSec.endsWith("]")) {
                try {
                    obj.sections = JSON.parse(rawSec);
                } catch {
                    obj.sections = [];
                }
            } else {
                obj.sections = [];
            }
        }

        // Author: if authorName / authorRole provided or author is JSON string
        if (typeof obj.author === "string" && obj.author.trim()) {
            const rawAuth = obj.author.trim();
            if (rawAuth.startsWith("{") && rawAuth.endsWith("}")) {
                try {
                    obj.author = JSON.parse(rawAuth);
                } catch {
                    obj.author = { name: rawAuth, role: "Cinematographer & Visual Storyteller" };
                }
            } else {
                obj.author = { name: rawAuth, role: "Cinematographer & Visual Storyteller" };
            }
        } else if (obj.authorName) {
            obj.author = {
                name: obj.authorName,
                role: obj.authorRole || "Cinematographer & Visual Storyteller",
            };
        }

        // Boolean conversion for isFeatured
        if (typeof obj.isFeatured === "string") {
            obj.isFeatured = obj.isFeatured.toLowerCase() === "true" || obj.isFeatured === "1";
        }

        records.push(obj);
    }

    return records;
}

export default { tokenizeCsv, parseCsv };


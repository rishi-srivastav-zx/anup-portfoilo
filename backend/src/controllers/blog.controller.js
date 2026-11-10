import { blogRepository } from "../repositories/blog.repository.js";
import imageService from "../modules/image.service.js";
import { recordCacheStatus } from "../utils/performanceTracker.js";

const { uploadMedia, deleteMedia, MediaUploadError } = imageService;

// ---------- constants ----------
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ["draft", "published"];
const LAYOUTS = ["wide", "standard"];
const BLOG_FOLDER = "/blogs";
const SLUG_TAKEN =
    "An article with this URL slug already exists. Please choose a unique slug.";

const CC_PRIVATE = "private, no-cache, no-store, must-revalidate";
const CC_PUBLIC_SHORT = "public, no-cache";
const CC_PUBLIC_LONG = "public, max-age=120, stale-while-revalidate=600";

// ---------- in-memory cache (sirf public/published reads ke liye) ----------
// Har write (create/update/delete/status/featured/bulk) pe poora cache clear hota hai,
// isliye response data same rehta hai, bas DB hit kam hota hai.
const CACHE_TTL = 30_000;
const CACHE_MAX = 500;
const cache = new Map();

const cached = (key, loader) => {
    const hit = cache.get(key);
    if (hit && hit.exp > Date.now()) {
        recordCacheStatus("HIT (In-Memory)");
        return hit.promise;
    }

    recordCacheStatus("MISS (Database)");
    const promise = loader();
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, { promise, exp: Date.now() + CACHE_TTL });
    // fail hua to cache me na rahe
    promise.catch(() => {
        if (cache.get(key)?.promise === promise) cache.delete(key);
    });
    return promise;
};

const invalidateCache = () => cache.clear();
export const invalidateBlogCache = invalidateCache;

// ---------- response helpers ----------
const isAdmin = (req) => req.user?.role === "admin";
const fail = (res, code, message, errors) =>
    res
        .status(code)
        .json({ success: false, message, ...(errors && { errors }) });

const validIds = (ids) =>
    Array.isArray(ids) &&
    ids.length > 0 &&
    ids.length <= 100 &&
    ids.every((i) => UUID_RE.test(i));

// ---------- text helpers ----------
const slugify = (str = "") =>
    String(str)
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 200);

const collectText = (node, out = []) => {
    if (node == null) return out;
    if (typeof node === "string") out.push(node);
    else if (Array.isArray(node)) node.forEach((n) => collectText(n, out));
    else if (typeof node === "object")
        Object.entries(node).forEach(([k, v]) => {
            if (!/(url|src|image|id|type|alt)$/i.test(k)) collectText(v, out);
        });
    return out;
};

const calcReadingTime = (introduction, sections, content) => {
    const text = collectText([introduction, sections, content])
        .join(" ")
        .replace(/<[^>]+>/g, " ");
    const words = text.split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const normalizeTags = (tags) => {
    const arr = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
          ? tags.split(",")
          : [];
    return [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))].slice(
        0,
        20,
    );
};

// multipart/form-data me objects string ban ke aate hain
const tryParseJson = (v) => {
    if (typeof v !== "string") return v;
    try {
        return JSON.parse(v);
    } catch {
        return v;
    }
};

// snake_case ya camelCase dono accept.
const normalizeBody = (b = {}) => {
    const pick = (camel, snake) =>
        b[camel] !== undefined ? b[camel] : b[snake];
    const out = {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        category: b.category,
        tags: b.tags,
        author: tryParseJson(b.author),
        featuredImage: pick("featuredImage", "featured_image"),
        featuredImageAlt: pick("featuredImageAlt", "featured_image_alt"),
        featuredImageFileId: pick(
            "featuredImageFileId",
            "featured_image_file_id",
        ),
        galleryImages: tryParseJson(pick("galleryImages", "gallery_images")),
        readingTime: pick("readingTime", "reading_time"),
        status: b.status,
        isFeatured: pick("isFeatured", "is_featured"),
        layoutVariant: pick("layoutVariant", "layout_variant"),
        technicalNote: pick("technicalNote", "technical_note"),
        introduction: tryParseJson(b.introduction),
        content: b.content,
        sections: tryParseJson(b.sections),
        seoTitle: pick("seoTitle", "seo_title"),
        seoDescription: pick("seoDescription", "seo_description"),
        seoKeywords: pick("seoKeywords", "seo_keywords"),
        canonicalUrl: pick("canonicalUrl", "canonical_url"),
        publishedAt: pick("publishedAt", "published_at"),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);

    if (out.title !== undefined) out.title = String(out.title).trim();
    if (out.slug !== undefined && out.slug) out.slug = slugify(out.slug);
    if (out.excerpt !== undefined) out.excerpt = String(out.excerpt).trim();
    if (out.category !== undefined) out.category = String(out.category).trim();
    if (out.tags !== undefined) out.tags = normalizeTags(out.tags);
    if (out.isFeatured !== undefined)
        out.isFeatured = out.isFeatured === true || out.isFeatured === "true";
    for (const k of [
        "seoTitle",
        "seoDescription",
        "seoKeywords",
        "canonicalUrl",
        "technicalNote",
    ])
        if (out[k] === "") out[k] = null;

    if (out.author && typeof out.author === "object") {
        if (!out.author.name || !String(out.author.name).trim()) {
            out.author.name = "Anup Rawat";
        }
        if (!out.author.role) {
            out.author.role = "Cinematographer & Visual Storyteller";
        }
    }
    return out;
};

const validate = (d, { partial = false } = {}) => {
    const errors = {};
    if (!partial) {
        if (!d.title) errors.title = "title is required";
    }
    if (d.title !== undefined && (!d.title || d.title.length > 255))
        errors.title = "title 1-255 chars ka hona chahiye";
    if (d.category !== undefined && d.category.length > 100)
        errors.category = "category max 100 chars";
    if (d.status !== undefined && !STATUSES.includes(d.status))
        errors.status = `status: ${STATUSES.join(" | ")}`;
    if (d.layoutVariant !== undefined && !LAYOUTS.includes(d.layoutVariant))
        errors.layoutVariant = `layoutVariant: ${LAYOUTS.join(" | ")}`;
    if (d.introduction !== undefined && !Array.isArray(d.introduction))
        errors.introduction = "array hona chahiye";
    if (d.sections !== undefined && !Array.isArray(d.sections))
        errors.sections = "array hona chahiye";
    if (d.galleryImages !== undefined && !Array.isArray(d.galleryImages))
        errors.galleryImages = "array hona chahiye";
    if (d.seoTitle && d.seoTitle.length > 255)
        errors.seoTitle = "max 255 chars";
    return Object.keys(errors).length ? errors : null;
};

// ---------- query helpers ----------
const parseListQuery = (q) => {
    const page = Math.max(parseInt(q.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(q.limit, 10) || 12, 1), 100);
    return {
        page,
        limit,
        offset:
            q.offset !== undefined
                ? Math.max(parseInt(q.offset, 10) || 0, 0)
                : (page - 1) * limit,
        category: q.category?.trim() || undefined,
        tag: q.tag?.trim() || undefined,
        search: q.search?.trim() || undefined,
        isFeatured:
            q.isFeatured !== undefined ? q.isFeatured === "true" : undefined,
        sortBy: q.sortBy,
        order: q.order,
    };
};

const paginate = ({ total, limit, offset }) => ({
    total,
    page: Math.floor(offset / limit) + 1,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: offset + limit < total,
    hasPrev: offset > 0,
});

const uniqueSlug = async (base, excludeId = null) => {
    const root = base || `post-${Date.now()}`;
    let slug = root;
    let i = 1;
    while (await blogRepository.slugExists(slug, excludeId))
        slug = `${root}-${++i}`;
    return slug;
};

// slug se article + related + adjacent (published ho to) -- ek hi jagah
const loadArticleBundle = async (slug) => {
    const blog = await blogRepository.findBySlug(slug);
    let related = [];
    let adjacent = { prev: null, next: null };
    if (blog && blog.status === "published") {
        [related, adjacent] = await Promise.all([
            blogRepository.findRelated(blog, 3),
            blogRepository.getAdjacent(blog.publishedAt),
        ]);
    }
    return { blog, related, adjacent };
};

// ---------- media helpers ----------
// Cleanup best-effort hai: fail ho to request fail nahi hoti, bas log hota hai
const safeDelete = async (fileId) => {
    if (!fileId) return;
    try {
        await deleteMedia(fileId);
    } catch (e) {
        console.error("[blog] ImageKit cleanup failed:", fileId, e.cause || e);
    }
};

const safeDeleteMany = (fileIds) =>
    Promise.all(fileIds.filter(Boolean).map(safeDelete));

// Background cleanup: response ImageKit ka wait nahi karta (safeDelete kabhi throw nahi karta)
const cleanupInBackground = (fileIds) => {
    const ids = [].concat(fileIds).filter(Boolean);
    if (ids.length) void safeDeleteMany(ids);
};

const uploadFeatured = async (file) => {
    if (!file.mimetype?.startsWith("image/"))
        throw new MediaUploadError("Featured image must be an image", {
            status: 415,
        });
    return uploadMedia(file, BLOG_FOLDER, ["blog"]);
};

// ---------- error + id handling ----------
// Har handler ke liye try/catch repeat nahi karna padta
const handle = (fn) => async (req, res, next) => {
    try {
        await fn(req, res);
    } catch (e) {
        if (e instanceof MediaUploadError) {
            if (e.cause) console.error("[blog] media error:", e.cause);
            return fail(res, e.status, e.message);
        }
        if (e.code === "23505") return fail(res, 409, SLUG_TAKEN);
        next(e);
    }
};

// id valid + article exist: nahi to response bhej ke null return
const loadBlog = async (req, res) => {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
        fail(res, 400, "Invalid article id");
        return null;
    }
    const blog = await blogRepository.findById(id);
    if (!blog) {
        fail(res, 404, "Article not found");
        return null;
    }
    return blog;
};

// ---------- controller ----------
export const blogController = {
    // GET /api/blogs
    getAllBlogs: handle(async (req, res) => {
        const q = parseListQuery(req.query);
        const status =
            isAdmin(req) && req.query.status ? req.query.status : "published";
        if (status !== "all" && !STATUSES.includes(status))
            return fail(res, 400, "Invalid status");

        const isPublic = !isAdmin(req) && status === "published";
        const run = () => blogRepository.findAll({ ...q, status });
        const { items, total } = isPublic
            ? await cached(`list:${JSON.stringify(q)}`, run)
            : await run();

        res.setHeader("Cache-Control", isPublic ? CC_PUBLIC_SHORT : CC_PRIVATE);

        res.status(200).json({
            success: true,
            data: items,
            pagination: paginate({ total, ...q }),
        });
    }),

    // GET /api/blogs/featured
    getFeaturedBlogs: handle(async (req, res) => {
        const featured = await cached("featured", () =>
            blogRepository.getFeatured(),
        );

        res.setHeader("Cache-Control", CC_PUBLIC_SHORT);
        res.status(200).json({
            success: true,
            data: featured ? [featured] : [],
            featured: featured || null,
        });
    }),

    // GET /api/blogs/categories
    getCategories: handle(async (req, res) => {
        const scope =
            isAdmin(req) && req.query.status === "all" ? "all" : "published";
        res.setHeader(
            "Cache-Control",
            scope === "all" ? CC_PRIVATE : CC_PUBLIC_LONG,
        );
        const data =
            scope === "all"
                ? await blogRepository.getCategories(scope)
                : await cached("categories", () =>
                      blogRepository.getCategories(scope),
                  );
        res.status(200).json({ success: true, data });
    }),

    // GET /api/blogs/tags
    getTags: handle(async (req, res) => {
        const scope =
            isAdmin(req) && req.query.status === "all" ? "all" : "published";
        res.setHeader(
            "Cache-Control",
            scope === "all" ? CC_PRIVATE : CC_PUBLIC_LONG,
        );
        const data =
            scope === "all"
                ? await blogRepository.getTags(scope)
                : await cached("tags", () => blogRepository.getTags(scope));
        res.status(200).json({ success: true, data });
    }),

    // GET /api/blogs/:slug
    getBlogBySlug: handle(async (req, res) => {
        const { slug } = req.params;
        const admin = isAdmin(req);

        const { blog, related, adjacent } = admin
            ? await loadArticleBundle(slug)
            : await cached(`slug:${slug}`, () => loadArticleBundle(slug));

        if (!blog || (blog.status === "draft" && !admin))
            return fail(res, 404, "Article not found");

        res.setHeader(
            "Cache-Control",
            blog.status === "published" && !admin
                ? CC_PUBLIC_SHORT
                : CC_PRIVATE,
        );

        res.status(200).json({
            success: true,
            data: blog,
            related,
            ...adjacent,
        });
    }),

    // GET /api/blogs/admin/:id
    getBlogById: handle(async (req, res) => {
        res.setHeader("Cache-Control", CC_PRIVATE);
        const blog = await loadBlog(req, res);
        if (blog) res.status(200).json({ success: true, data: blog });
    }),

    // GET /api/blogs/admin/stats
    getStats: handle(async (req, res) => {
        res.setHeader("Cache-Control", CC_PRIVATE);
        res.status(200).json({
            success: true,
            data: await blogRepository.getStats(),
        });
    }),

    // POST /api/blogs/upload  (editor ke andar inline image/video ke liye)
    // multer: upload.single("file")
    uploadMedia: handle(async (req, res) => {
        if (!req.file) return fail(res, 422, "file is required");
        const media = await uploadMedia(req.file, BLOG_FOLDER, [
            "blog-content",
        ]);
        res.status(201).json({ success: true, data: media });
    }),

    // POST /api/blogs
    // multer: upload.single("image")  (optional; file na ho to featuredImage URL chalega)
    createBlog: handle(async (req, res) => {
        const data = normalizeBody(req.body);
        const errors = validate(data, { hasFile: !!req.file });
        if (errors) return fail(res, 422, "Validation failed", errors);

        // slug: user ne diya to unique check, warna title se auto-generate
        if (data.slug) {
            if (await blogRepository.slugExists(data.slug))
                return fail(res, 409, SLUG_TAKEN);
        } else {
            data.slug = await uniqueSlug(slugify(data.title));
        }

        data.status = data.status || "draft";
        data.category = data.category || "Cinematography";
        data.excerpt = data.excerpt || "";
        data.readingTime =
            data.readingTime ||
            calcReadingTime(data.introduction, data.sections, data.content);
        if (data.status === "published" && !data.publishedAt)
            data.publishedAt = new Date();
        if (!data.seoTitle)
            data.seoTitle = `${data.title} | Anup Rawat`.slice(0, 255);
        if (!data.seoDescription)
            data.seoDescription = (data.excerpt || data.title).slice(0, 300);
        if (!data.canonicalUrl && data.slug)
            data.canonicalUrl = `https://anuprawat.com/blog/${data.slug}`;
        if (!data.seoKeywords && data.tags?.length)
            data.seoKeywords = data.tags.join(", ");

        // validation pass hone ke baad hi upload, taaki bekar file na jaye
        let uploaded = null;
        if (req.file) {
            uploaded = await uploadFeatured(req.file);
            data.featuredImage = uploaded.url;
            data.featuredImageFileId = uploaded.fileId;
        }

        try {
            const blog = await blogRepository.create({
                ...data,
                userId: req.user?.id || null,
            });
            invalidateCache();
            res.status(201).json({
                success: true,
                message: "Article created successfully",
                data: blog,
            });
        } catch (e) {
            cleanupInBackground(uploaded?.fileId); // rollback: DB fail to image bhi hatao
            throw e;
        }
    }),

    // PUT /api/blogs/:id  (partial fields bhi chalenge)
    // multer: upload.single("image")
    updateBlog: handle(async (req, res) => {
        const existing = await loadBlog(req, res);
        if (!existing) return;
        const { id } = existing;

        const data = normalizeBody(req.body);
        const errors = validate(data, { partial: true });
        if (errors) return fail(res, 422, "Validation failed", errors);

        if (
            data.slug &&
            data.slug !== existing.slug &&
            (await blogRepository.slugExists(data.slug, id))
        )
            return fail(res, 409, SLUG_TAKEN);

        // content badla aur readingTime manually nahi diya -> recalc
        if (
            data.readingTime === undefined &&
            (data.introduction !== undefined ||
                data.sections !== undefined ||
                data.content !== undefined)
        ) {
            data.readingTime = calcReadingTime(
                data.introduction ?? existing.introduction,
                data.sections ?? existing.sections,
                data.content ?? existing.content,
            );
        }

        // pehli baar publish -> publishedAt set; draft me wapas -> purana rehne do
        if (
            data.status === "published" &&
            !existing.publishedAt &&
            !data.publishedAt
        )
            data.publishedAt = new Date();

        // featured image: nayi file ya manually alag URL -> purani ImageKit file replace hogi
        let uploaded = null;
        let replacesOld = false;
        if (req.file) {
            uploaded = await uploadFeatured(req.file);
            data.featuredImage = uploaded.url;
            data.featuredImageFileId = uploaded.fileId;
            replacesOld = true;
        } else if (
            data.featuredImage !== undefined &&
            data.featuredImage !== existing.featuredImage
        ) {
            data.featuredImageFileId = null;
            replacesOld = true;
        }

        let updated;
        try {
            updated = await blogRepository.update(id, data);
        } catch (e) {
            cleanupInBackground(uploaded?.fileId); // rollback
            throw e;
        }
        invalidateCache();

        // update success hone ke baad hi purani file delete (background me)
        if (replacesOld) cleanupInBackground(existing.featuredImageFileId);

        res.status(200).json({
            success: true,
            message: "Article updated successfully",
            data: updated,
        });
    }),

    // PATCH /api/blogs/:id/status
    updateStatus: handle(async (req, res) => {
        const { status } = req.body;
        if (!STATUSES.includes(status))
            return fail(res, 422, `status: ${STATUSES.join(" | ")}`);

        const existing = await loadBlog(req, res);
        if (!existing) return;

        const patch = { status };
        if (status === "published" && !existing.publishedAt)
            patch.publishedAt = new Date();

        const updated = await blogRepository.update(existing.id, patch);
        invalidateCache();
        res.status(200).json({
            success: true,
            message: `Article ${status}`,
            data: updated,
        });
    }),

    // PATCH /api/blogs/:id/featured
    toggleFeatured: handle(async (req, res) => {
        const existing = await loadBlog(req, res);
        if (!existing) return;

        const nextFeatured = !existing.isFeatured;
        const updated = await blogRepository.setFeatured(
            existing.id,
            nextFeatured,
        );
        invalidateCache();

        res.status(200).json({
            success: true,
            message: updated.isFeatured
                ? "Marked as featured"
                : "Removed from featured",
            data: updated,
        });
    }),

    // POST /api/blogs/bulk/status
    bulkUpdateStatus: handle(async (req, res) => {
        const { ids, status } = req.body;
        if (!validIds(ids))
            return fail(res, 422, "ids: 1-100 valid UUIDs ka array do");
        if (!STATUSES.includes(status))
            return fail(res, 422, `status: ${STATUSES.join(" | ")}`);

        const count = await blogRepository.bulkUpdateStatus(ids, status);
        invalidateCache();
        res.status(200).json({
            success: true,
            message: `${count} article(s) updated`,
            count,
        });
    }),

    // POST /api/blogs/bulk/delete
    bulkDelete: handle(async (req, res) => {
        const { ids } = req.body;
        if (!validIds(ids))
            return fail(res, 422, "ids: 1-100 valid UUIDs ka array do");

        const blogs = await blogRepository.findByIds(ids); // fileIds ke liye pehle fetch
        const count = await blogRepository.bulkDelete(ids);
        invalidateCache();
        cleanupInBackground(blogs.map((b) => b.featuredImageFileId));

        res.status(200).json({
            success: true,
            message: `${count} article(s) deleted`,
            count,
        });
    }),

    // DELETE /api/blogs/:id
    deleteBlog: handle(async (req, res) => {
        const existing = await loadBlog(req, res);
        if (!existing) return;

        await blogRepository.delete(existing.id);
        invalidateCache();
        cleanupInBackground(existing.featuredImageFileId);

        res.status(200).json({
            success: true,
            message: "Article deleted successfully",
        });
    }),
};

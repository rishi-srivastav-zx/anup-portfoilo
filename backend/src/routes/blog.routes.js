import { Router } from "express";
import { blogController } from "../controllers/blog.controller.js";
import { blogImportController } from "../controllers/blogImport.controller.js";
import { blogQueueController } from "../controllers/blogQueue.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { uploadImage, uploadFile, uploadBulkImport } from "../middleware/uploadMiddleware.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { ACCESS_COOKIE_NAME } from "../utils/cookies.js";
import { performanceMiddleware } from "../utils/performanceTracker.js";

const router = Router();

// Track API lifecycle, connection checkout, SQL queries, and response size
router.use(performanceMiddleware);

// Optional authentication middleware for public endpoints to detect logged-in admin
// using a single SQL JOIN without failing when unauthenticated or token is expired
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.[ACCESS_COOKIE_NAME];
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        let payload;
        try {
            payload = verifyAccessToken(token);
        } catch {
            return next();
        }

        const authData = await sessionRepository.findSessionWithUser(payload.sid);
        if (
            !authData ||
            !authData.session ||
            authData.session.is_revoked ||
            new Date(authData.session.expires_at) < new Date()
        ) {
            return next();
        }

        if (
            !authData.user ||
            !authData.user.is_active ||
            authData.session.user_id !== payload.sub
        ) {
            return next();
        }

        req.user = authData.user;
        req.session = authData.session;
    } catch {
        // Ignore errors in optional auth and treat as public user
    }
    next();
};

// ==========================================
// Public routes
// ==========================================
// GET /api/blogs (supports query params: page, limit, category, tag, search, isFeatured, sortBy, order; admin can pass ?status=all)
router.get("/", optionalAuth, blogController.getAllBlogs);

// GET /api/blogs/featured (featured published blogs)
router.get("/featured", blogController.getFeaturedBlogs);

// GET /api/blogs/categories
router.get("/categories", optionalAuth, blogController.getCategories);

// GET /api/blogs/tags
router.get("/tags", optionalAuth, blogController.getTags);

// ==========================================
// Admin routes (Protected)
// ==========================================
// GET /api/blogs/admin/stats
router.get(
    "/admin/stats",
    authenticate,
    authorizeRoles("admin"),
    blogController.getStats
);

// GET /api/blogs/admin/:id (load article by UUID for admin editor)
router.get(
    "/admin/:id",
    authenticate,
    authorizeRoles("admin"),
    blogController.getBlogById
);

// POST /api/blogs/upload (inline image/video upload from editor)
router.post(
    "/upload",
    authenticate,
    authorizeRoles("admin"),
    uploadFile,
    blogController.uploadMedia
);

// POST /api/blogs/bulk/status
router.post(
    "/bulk/status",
    authenticate,
    authorizeRoles("admin"),
    blogController.bulkUpdateStatus
);

// POST /api/blogs/bulk/delete
router.post(
    "/bulk/delete",
    authenticate,
    authorizeRoles("admin"),
    blogController.bulkDelete
);

// ==========================================
// Phase 2 & 3: Bulk Blog Scheduler & Queue Management Routes
// ==========================================
// POST /api/blogs/import/preview (Validate & preview JSON or CSV)
router.post(
    "/import/preview",
    authenticate,
    authorizeRoles("admin"),
    uploadBulkImport,
    blogImportController.previewImport
);

// POST /api/blogs/import (Execute bulk import & enqueue for scheduled publishing)
router.post(
    "/import",
    authenticate,
    authorizeRoles("admin"),
    uploadBulkImport,
    blogImportController.bulkImport
);

// GET /api/blogs/scheduler/stats (Queue metrics and scheduler overview)
router.get(
    "/scheduler/stats",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.getQueueStats
);

// GET /api/blogs/scheduler/settings (Get current scheduler configuration)
router.get(
    "/scheduler/settings",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.getSettings
);

// PATCH /api/blogs/scheduler/settings (Update interval, daily limit, timezone, enabled)
router.patch(
    "/scheduler/settings",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.updateSettings
);

// GET /api/blogs/scheduler/queue (List queued blogs with search, status filtering, pagination)
router.get(
    "/scheduler/queue",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.getQueue
);

// POST /api/blogs/scheduler/queue/reorder (Sequentially reorder pending queue jobs)
router.post(
    "/scheduler/queue/reorder",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.reorderQueue
);

// POST /api/blogs/scheduler/queue/:id/cancel (Cancel pending queue job)
router.post(
    "/scheduler/queue/:id/cancel",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.cancelQueueItem
);

// POST /api/blogs/scheduler/queue/:id/retry (Reset and retry failed queue job)
router.post(
    "/scheduler/queue/:id/retry",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.retryQueueItem
);

// POST /api/blogs/scheduler/queue/:id/publish (Real transactional manual publishing)
router.post(
    "/scheduler/queue/:id/publish",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.manualPublish
);

// GET /api/blogs/scheduler/logs (Paginated audit logs of all scheduler operations)
router.get(
    "/scheduler/logs",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.getPublishLogs
);

// GET /api/blogs/scheduler/worker/health (Worker daemon health & queue diagnostics)
router.get(
    "/scheduler/worker/health",
    optionalAuth,
    blogQueueController.getWorkerHealth
);

// POST /api/blogs/scheduler/cron-trigger AND /api/blogs/scheduler/worker/tick
// (External cron webhook for serverless/cron setups and internal ticks)
router.post(
    "/scheduler/cron-trigger",
    optionalAuth,
    blogQueueController.triggerCron
);
router.post(
    "/scheduler/worker/tick",
    optionalAuth,
    blogQueueController.triggerCron
);

// POST /api/blogs/scheduler/revalidate (On-demand cache revalidation for published blog)
router.post(
    "/scheduler/revalidate",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.revalidateBlog
);

// GET /api/blogs/:id/publishing-history (Audit history and queue status for single blog)
router.get(
    "/:id/publishing-history",
    authenticate,
    authorizeRoles("admin"),
    blogQueueController.getBlogHistory
);

// POST /api/blogs (create blog with optional multipart featured image upload)
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    uploadImage,
    blogController.createBlog
);

// PUT /api/blogs/:id (update blog with optional multipart featured image upload)
router.put(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    uploadImage,
    blogController.updateBlog
);

// PATCH /api/blogs/:id/status
router.patch(
    "/:id/status",
    authenticate,
    authorizeRoles("admin"),
    blogController.updateStatus
);

// PATCH /api/blogs/:id/featured
router.patch(
    "/:id/featured",
    authenticate,
    authorizeRoles("admin"),
    blogController.toggleFeatured
);

// DELETE /api/blogs/:id
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    blogController.deleteBlog
);

// ==========================================
// Public Dynamic Route (Must be last to avoid catching specific routes)
// ==========================================
// GET /api/blogs/:slug
router.get("/:slug", optionalAuth, blogController.getBlogBySlug);

export default router;

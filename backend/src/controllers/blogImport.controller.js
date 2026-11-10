import { blogImportService } from "../services/blogImport.service.js";
import { blogQueueRepository } from "../repositories/blogQueue.repository.js";
import { bulkImportOptionsSchema } from "../validators/blogImport.validator.js";

const fail = (res, code, message, extra = {}) =>
    res.status(code).json({
        success: false,
        message,
        ...extra,
    });

export const blogImportController = {
    /**
     * POST /api/blogs/import/preview
     * Parses and validates JSON or CSV without saving to database.
     */
    previewImport: async (req, res, next) => {
        try {
            const file = req.file;
            const body = req.body;

            const input = file ? file.buffer : body.blogs || body;
            const mimetype = file ? file.mimetype : req.headers["content-type"] || "";
            const filename = file ? file.originalname : "";

            const options = {
                mimetype,
                filename,
                autoDisambiguateSlugs:
                    body.autoDisambiguateSlugs === true ||
                    body.autoDisambiguateSlugs === "true",
            };

            const preview = await blogImportService.previewImport(input, options);
            return res.status(200).json(preview);
        } catch (err) {
            return fail(res, 400, err.message);
        }
    },

    /**
     * POST /api/blogs/import
     * Imports blogs into blogs table as drafts and enqueues them in blog_publish_queue.
     */
    bulkImport: async (req, res, next) => {
        try {
            const file = req.file;
            const body = req.body;

            const input = file ? file.buffer : body.blogs || body;
            const mimetype = file ? file.mimetype : req.headers["content-type"] || "";
            const filename = file ? file.originalname : "";

            // Parse options
            const rawOptions = {
                allowPartial:
                    body.allowPartial === true ||
                    body.allowPartial === "true" ||
                    req.query.allowPartial === "true",
                autoDisambiguateSlugs:
                    body.autoDisambiguateSlugs === true ||
                    body.autoDisambiguateSlugs === "true",
                startPublishAt: body.startPublishAt || req.query.startPublishAt || null,
                publishingIntervalMinutes: body.publishingIntervalMinutes
                    ? Number(body.publishingIntervalMinutes)
                    : undefined,
            };

            const optionsValidation = bulkImportOptionsSchema.safeParse(rawOptions);
            if (!optionsValidation.success) {
                return fail(
                    res,
                    422,
                    "Invalid import options",
                    { errors: optionsValidation.error.issues }
                );
            }

            const idempotencyKey =
                req.headers["idempotency-key"] ||
                req.headers["x-idempotency-key"] ||
                body.idempotencyKey ||
                null;

            const result = await blogImportService.executeImport(
                input,
                { ...optionsValidation.data, mimetype, filename },
                {
                    userId: req.user?.id || null,
                    idempotencyKey,
                }
            );

            if (!result.success) {
                return res.status(422).json(result);
            }

            return res.status(200).json(result);
        } catch (err) {
            return fail(res, 500, err.message);
        }
    },

    /**
     * GET /api/blogs/scheduler/settings
     */
    getSchedulerSettings: async (req, res, next) => {
        try {
            const settings = await blogQueueRepository.getSettings();
            return res.status(200).json({
                success: true,
                data: settings,
            });
        } catch (err) {
            return fail(res, 500, err.message);
        }
    },

    /**
     * PATCH /api/blogs/scheduler/settings
     */
    updateSchedulerSettings: async (req, res, next) => {
        try {
            const body = req.body;
            const updated = await blogQueueRepository.updateSettings({
                enabled: body.enabled,
                publishingIntervalMinutes: body.publishingIntervalMinutes
                    ? Number(body.publishingIntervalMinutes)
                    : undefined,
                dailyPublishLimit: body.dailyPublishLimit
                    ? Number(body.dailyPublishLimit)
                    : undefined,
                nextPublishAt: body.nextPublishAt,
                timezone: body.timezone,
            });

            return res.status(200).json({
                success: true,
                message: "Scheduler settings updated successfully",
                data: updated,
            });
        } catch (err) {
            return fail(res, 400, err.message);
        }
    },

    /**
     * GET /api/blogs/scheduler/queue
     */
    getSchedulerQueue: async (req, res, next) => {
        try {
            const { status, page = 1, limit = 50 } = req.query;
            const result = await blogQueueRepository.listQueue({
                status,
                page: Number(page),
                limit: Number(limit),
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (err) {
            return fail(res, 500, err.message);
        }
    },
};

export default blogImportController;


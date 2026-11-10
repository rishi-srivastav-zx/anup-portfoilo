import { AuthError } from "../services/auth.service.js";
import { ChatError } from "../services/chat.service.js";
import { KnowledgeError } from "../services/portfolioKnowledge.service.js";
import { ChatDatabaseError } from "../repositories/chat.repository.js";
import { env } from "../config/env.js";

/**
 * Standardized 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
 * Centralized Application Error Handler
 */
export const errorHandler = (err, req, res, next) => {
    // If response headers already sent, delegate to default express handler
    if (res.headersSent) {
        return next(err);
    }

    // Custom Application Auth Errors
    if (err instanceof AuthError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    // Custom Application Chat Errors
    if (err instanceof ChatError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    // Custom Application Knowledge Management Errors
    if (err instanceof KnowledgeError || (err.statusCode && err.statusCode < 500)) {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message,
            code: err.code || "KNOWLEDGE_ERROR",
        });
    }

    // Database Failures (Clean response without exposing internal credentials)
    if (err instanceof ChatDatabaseError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    // Multer file upload errors (e.g. LIMIT_FILE_SIZE, invalid extension/MIME)
    if (err.code === "LIMIT_FILE_SIZE" || err.status === 415) {
        return res.status(err.status || 413).json({
            success: false,
            message: err.code === "LIMIT_FILE_SIZE" ? "File size exceeds allowed limit." : err.message,
            code: err.code || "FILE_UPLOAD_ERROR",
        });
    }

    // CORS errors
    if (err.message && err.message.includes("CORS")) {
        return res.status(403).json({
            success: false,
            message: "CORS error: Request origin not allowed.",
        });
    }

    // JSON parsing syntax error
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Malformed JSON payload.",
        });
    }

    // PostgreSQL Unique Constraint Violation
    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "A record with this information already exists.",
        });
    }

    // Log the unexpected error internally without leaking to client
    console.error("Unhandled Server Error:", err);

    res.status(500).json({
        success: false,
        message:
            env.NODE_ENV === "production"
                ? "An unexpected internal server error occurred."
                : err.message,
    });
};

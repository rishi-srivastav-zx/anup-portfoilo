import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import sketchbookRoutes from "./routes/sketchbook.routes.js";
import workProjectRoutes from "./routes/workProject.routes.js";
import chatRoutes from "./routes/chat.routes.js";

// Error Handlers
import {
    errorHandler,
    notFoundHandler,
} from "./middleware/errorHandler.js";
import { schedulerWorker } from "./workers/blogSchedulerWorker.js";

const app = express();

// Security HTTP headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// Secure CORS configuration with credentials support
const configuredOrigins = (env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const allowedOrigins = Array.from(
    new Set([
        ...configuredOrigins,
        "https://anuprawatstudio.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ])
);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.replace(/\/+$/, "");
            if (
                allowedOrigins.includes(cleanOrigin) ||
                cleanOrigin === "https://anuprawatstudio.vercel.app" ||
                cleanOrigin.endsWith(".vercel.app") ||
                (env.NODE_ENV !== "production" &&
                    (cleanOrigin.includes("localhost") || cleanOrigin.includes("127.0.0.1")))
            ) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
    })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parser for reading HttpOnly refresh cookies
app.use(cookieParser());

// Trust first proxy when in production behind reverse proxies / Vercel
if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// Existing root welcome endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Portfolio backend is running!",
    });
});

// Lightweight health check endpoint for keep-alive monitoring (zero database overhead)
app.get("/api/health", async (req, res) => {
    // Optional deep health-check when explicitly requested with ?db=true
    if (req.query?.db === "true") {
        try {
            await pool.query("SELECT 1");
            return res.status(200).json({
                status: "healthy",
                database: "connected",
                timestamp: new Date().toISOString(),
                uptime: Math.floor(process.uptime()),
            });
        } catch {
            return res.status(503).json({
                status: "degraded",
                database: "disconnected",
                timestamp: new Date().toISOString(),
                uptime: Math.floor(process.uptime()),
            });
        }
    }

    // Default lightweight health response: fast, zero DB queries, no sensitive data exposed
    return res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/leads", enquiryRoutes);
app.use("/api/sketchbook", sketchbookRoutes);
app.use("/api/sketchbook-images", sketchbookRoutes);
app.use("/api/work-projects", workProjectRoutes);
app.use("/api/chat", chatRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    if (env.NODE_ENV !== "test") {
        schedulerWorker.start({ intervalMs: 60000 });
    }
});

export default app;

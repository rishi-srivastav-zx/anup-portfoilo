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
const allowedOrigins = [
    env.FRONTEND_URL?.replace(/\/+$/, ""),
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            const cleanOrigin = origin?.replace(/\/+$/, "");
            if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
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

// Existing database health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");
        res.json({
            success: true,
            message: "Backend and Neon are connected!",
            databaseTime: result.rows[0].current_time,
        });
    } catch (error) {
        console.error("Health check failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
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

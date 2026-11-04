import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root first, then backend/.env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z
        .string()
        .transform((v) => parseInt(v, 10))
        .default(5000),
    FRONTEND_URL: z.string().url().default("http://localhost:3001"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    ACCESS_TOKEN_SECRET: z
        .string()
        .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("24h"),
    REFRESH_TOKEN_DAYS: z
        .string()
        .transform((v) => parseInt(v, 10))
        .default(7),
    ACCESS_TOKEN_ISSUER: z.string().default("cinematographer-portfolio"),
    ACCESS_TOKEN_AUDIENCE: z.string().default("cinematographer-portfolio-client"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Environment validation error:");
    parsed.error.issues.forEach((issue) => {
        console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

export const env = Object.freeze(parsed.data);

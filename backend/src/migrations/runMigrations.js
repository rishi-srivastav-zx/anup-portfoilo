import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { env } from "../config/env.js";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
    const client = new Client({ connectionString: env.DATABASE_URL });
    await client.connect();
    try {
        console.log("🚀 Starting database migrations...");

        // Ensure schema_migrations table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Read all .sql files in this directory
        const files = fs
            .readdirSync(__dirname)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            // Check if already applied
            const res = await client.query(
                "SELECT 1 FROM schema_migrations WHERE migration_name = $1",
                [file]
            );

            if (res.rowCount > 0) {
                console.log(`⏩ Skipping already applied migration: ${file}`);
                continue;
            }

            console.log(`⏳ Applying migration: ${file}...`);
            const filePath = path.join(__dirname, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await client.query("BEGIN");
            try {
                await client.query(sql);
                await client.query(
                    "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
                    [file]
                );
                await client.query("COMMIT");
                console.log(`✅ Applied migration: ${file}`);
            } catch (migrationError) {
                await client.query("ROLLBACK");
                throw new Error(
                    `Failed executing ${file}: ${migrationError.message}`
                );
            }
        }

        console.log("🎉 All migrations applied successfully!");
    } finally {
        await client.end();
    }
};

// If run directly from terminal:
if (process.argv[1] === __filename) {
    runMigrations()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("❌ Migration failed:", err);
            process.exit(1);
        });
}

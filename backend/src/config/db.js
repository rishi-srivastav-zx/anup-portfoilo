import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

pool.on("error", (error) => {
    console.error("❌ Unexpected database error:", error.message);
});

export const connectDB = async (retries = 5, delayMs = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const client = await pool.connect();
            await client.query("SELECT 1");
            client.release();
            console.log("✅ Database connected successfully");
            return;
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);
            if (attempt < retries) {
                console.log(`⏳ Retrying database connection in ${delayMs / 1000}s...`);
                await new Promise((res) => setTimeout(res, delayMs));
            } else {
                console.error("❌ All database connection attempts failed. Check internet connection and Neon status.");
            }
        }
    }
};

connectDB();


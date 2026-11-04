import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

// Tuned for Neon serverless PostgreSQL & Neon PgBouncer pooler
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10, // Sensible connection cap for Neon PgBouncer to prevent connection exhaustion
    idleTimeoutMillis: 30000, // Release idle clients after 30s of inactivity
    connectionTimeoutMillis: 20000, // 20s connection timeout
    keepAlive: true, // Enable TCP keep-alive packets
    keepAliveInitialDelayMillis: 10000, // Send TCP keep-alive every 10 seconds through firewalls/NAT
    allowExitOnIdle: true, // Allow test runners and CLI scripts to terminate cleanly when idle
});

// Safe idle client error handler to avoid crashing the server process
pool.on("error", (error) => {
    console.error("❌ Unexpected database pool error on idle client:", error.message);
});

export const connectDB = async (retries = 5, delayMs = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        let client;
        try {
            client = await pool.connect();
            await client.query("SELECT 1");
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
        } finally {
            if (client) {
                client.release();
            }
        }
    }
};

connectDB();

import dns from "node:dns";
import pg from "pg";
import { env } from "./env.js";
import { instrumentPool } from "../utils/performanceTracker.js";

/**
 * DNS Resolution Strategy:
 * Standard OS DNS resolution is used by default in all environments.
 * An isolated fallback resolver (default: 8.8.8.8, 1.1.1.1) is enabled in development/test
 * or when explicitly configured via ENABLE_DNS_FALLBACK=true to mitigate local ISP/Wi-Fi
 * DNS refusal (RCODE_REFUSED) against Neon cloud endpoints without modifying global DNS.
 */
const shouldEnableDnsFallback =
    env.ENABLE_DNS_FALLBACK === "true" ||
    (env.NODE_ENV !== "production" && env.ENABLE_DNS_FALLBACK !== "false");

if (shouldEnableDnsFallback) {
    try {
        const fallbackServers = (env.DNS_FALLBACK_SERVERS || "8.8.8.8,1.1.1.1")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const isolatedResolver = new dns.Resolver();
        isolatedResolver.setServers(fallbackServers);

        const originalLookup = dns.lookup;
        dns.lookup = (hostname, options, callback) => {
            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            originalLookup(hostname, options, (err, address, family) => {
                // Only invoke fallback resolver if system DNS explicitly failed on neon host
                if (
                    err &&
                    (err.code === "ENOTFOUND" || err.code === "EREFUSED" || err.code === "EAI_AGAIN") &&
                    hostname.includes("neon.tech")
                ) {
                    isolatedResolver.resolve4(hostname, (rErr, addresses) => {
                        if (rErr || !addresses || addresses.length === 0) {
                            return callback(err);
                        }
                        if (options && options.all) {
                            return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
                        }
                        return callback(null, addresses[0], 4);
                    });
                } else {
                    callback(err, address, family);
                }
            });
        };
    } catch {
        // Non-fatal if runtime disallows lookup wrapping
    }
}

const { Pool } = pg;

// Tuned for Neon serverless PostgreSQL & Neon PgBouncer pooler
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10, // Sensible connection cap for Neon PgBouncer to prevent connection exhaustion
    idleTimeoutMillis: 300000, // Keep warm connections for 5m across active reading sessions
    connectionTimeoutMillis: 20000, // 20s connection timeout
    keepAlive: true, // Enable TCP keep-alive packets
    keepAliveInitialDelayMillis: 10000, // Send TCP keep-alive every 10 seconds through firewalls/NAT
    allowExitOnIdle: true, // Allow test runners and CLI scripts to terminate cleanly when idle
});

// Instrument pool for lightweight query and connection lifecycle tracking
instrumentPool(pool);

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
            const sanitizedError = (error.message || "").replace(/:[^:@]+@/, ":[REDACTED]@");
            console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, sanitizedError);
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

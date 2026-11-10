import { AsyncLocalStorage } from "node:async_hooks";
import { performance } from "node:perf_hooks";

// Request-scoped storage for tracking database and API lifecycle timings
export const perfStorage = new AsyncLocalStorage();

/**
 * Get the current request's performance context
 */
export function getPerfStore() {
    return perfStorage.getStore() || null;
}

/**
 * Record cache hit/miss for in-memory caching
 */
export function recordCacheStatus(status) {
    const store = getPerfStore();
    if (store) {
        store.cacheStatus = status;
    }
}

/**
 * Sanitize SQL string for logging:
 * - Collapses whitespace/newlines into single spaces
 * - Never includes parameters or values
 * - Truncates excessively long queries for clean logs
 */
function sanitizeSql(text) {
    if (!text) return "UNKNOWN QUERY";
    const raw = typeof text === "string" ? text : text.text || String(text);
    const cleaned = raw.replace(/\s+/g, " ").trim();
    if (cleaned.length > 120) {
        return cleaned.slice(0, 117) + "...";
    }
    return cleaned;
}

/**
 * Calculates the non-overlapping elapsed wall-clock time spent on database operations
 * (correctly merges overlapping intervals from concurrent queries, e.g. Promise.all).
 */
export function calculateWallClockDbTime(intervals) {
    if (!intervals || intervals.length === 0) return 0;
    const sorted = intervals.slice().sort((a, b) => a.start - b.start);
    let total = 0;
    let currentStart = sorted[0].start;
    let currentEnd = sorted[0].end;

    for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];
        if (next.start <= currentEnd) {
            if (next.end > currentEnd) {
                currentEnd = next.end;
            }
        } else {
            total += currentEnd - currentStart;
            currentStart = next.start;
            currentEnd = next.end;
        }
    }
    total += currentEnd - currentStart;
    return total;
}

/**
 * Instruments a pg.Pool instance to accurately measure:
 * 1. Connection checkout duration
 * 2. Individual query duration
 * 3. Query count
 * 4. Wall-clock database operation span
 * Without altering queries, pooling limits, transactions, or results.
 */
export function instrumentPool(pool) {
    if (!pool || pool._isInstrumented) return pool;
    pool._isInstrumented = true;

    const originalConnect = pool.connect.bind(pool);

    pool.connect = function (cb) {
        const startConn = performance.now();
        const store = getPerfStore();

        const patchClient = (client) => {
            if (!client || client._isQueryInstrumented) return client;
            client._isQueryInstrumented = true;

            const originalClientQuery = client.query.bind(client);

            client.query = function (text, values, queryCb) {
                const startQuery = performance.now();
                const clientStore = getPerfStore();

                if (typeof values === "function") {
                    queryCb = values;
                    values = undefined;
                }

                const recordTiming = (isError = false) => {
                    const endQuery = performance.now();
                    const duration = endQuery - startQuery;
                    if (clientStore) {
                        clientStore.queryCount++;
                        clientStore.totalQueryTime += duration;
                        clientStore.dbIntervals.push({ start: startQuery, end: endQuery });
                        clientStore.queries.push({
                            sql: sanitizeSql(text),
                            durationMs: duration,
                            isSlow: duration >= 100,
                            isError,
                        });
                    }
                };

                // Callback-style query
                if (typeof queryCb === "function") {
                    return originalClientQuery(text, values, (err, res) => {
                        recordTiming(Boolean(err));
                        queryCb(err, res);
                    });
                }

                // Promise-style query
                return originalClientQuery(text, values).then(
                    (res) => {
                        recordTiming(false);
                        return res;
                    },
                    (err) => {
                        recordTiming(true);
                        throw err;
                    }
                );
            };

            return client;
        };

        // Callback-style pool.connect(cb)
        if (typeof cb === "function") {
            return originalConnect((err, client, release) => {
                const endConn = performance.now();
                const connDuration = endConn - startConn;
                if (store) {
                    store.totalConnectionTime += connDuration;
                    store.dbIntervals.push({ start: startConn, end: endConn });
                }
                if (client) {
                    patchClient(client);
                }
                cb(err, client, release);
            });
        }

        // Promise-style await pool.connect()
        return originalConnect().then((client) => {
            const endConn = performance.now();
            const connDuration = endConn - startConn;
            if (store) {
                store.totalConnectionTime += connDuration;
                store.dbIntervals.push({ start: startConn, end: endConn });
            }
            if (client) {
                patchClient(client);
            }
            return client;
        });
    };

    return pool;
}

/**
 * Express middleware to track lifecycle metrics:
 * - Total request duration
 * - Database connection time
 * - Query duration & count
 * - Wall-clock DB duration (handling overlapping parallel queries)
 * - True controller processing duration
 * - Response payload size
 * - Server-Timing header
 */
export function performanceMiddleware(req, res, next) {
    const startTotal = performance.now();

    const store = {
        method: req.method,
        url: req.originalUrl || req.url,
        queryCount: 0,
        totalQueryTime: 0,
        totalConnectionTime: 0,
        dbIntervals: [],
        queries: [],
        cacheStatus: "N/A",
        payloadBytes: 0,
    };

    // Track response payload size safely
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = function (chunk, encoding, cb) {
        if (chunk) {
            store.payloadBytes += Buffer.isBuffer(chunk)
                ? chunk.length
                : Buffer.byteLength(chunk, typeof encoding === "string" ? encoding : "utf8");
        }
        return originalWrite(chunk, encoding, cb);
    };

    res.end = function (chunk, encoding, cb) {
        if (chunk) {
            store.payloadBytes += Buffer.isBuffer(chunk)
                ? chunk.length
                : Buffer.byteLength(chunk, typeof encoding === "string" ? encoding : "utf8");
        }
        return originalEnd(chunk, encoding, cb);
    };

    // Attach Server-Timing headers before sending headers
    const originalSend = res.send.bind(res);
    res.send = function (body) {
        if (!res.headersSent) {
            const durationSoFar = performance.now() - startTotal;
            const wallClockDbTime = calculateWallClockDbTime(store.dbIntervals);
            const connTime = store.totalConnectionTime;
            const ctrlTime = Math.max(0, durationSoFar - wallClockDbTime);

            const serverTiming = [
                `total;dur=${durationSoFar.toFixed(1)}`,
                `db;dur=${wallClockDbTime.toFixed(1)}`,
                `conn;dur=${connTime.toFixed(1)}`,
                `ctrl;dur=${ctrlTime.toFixed(1)}`,
            ].join(", ");

            res.setHeader("Server-Timing", serverTiming);
        }
        return originalSend(body);
    };

    // Log structured report when response finishes
    res.on("finish", () => {
        const totalDuration = performance.now() - startTotal;
        const connTime = store.totalConnectionTime;
        const querySum = store.totalQueryTime;
        const wallClockDbTime = calculateWallClockDbTime(store.dbIntervals);
        const ctrlTime = Math.max(0, totalDuration - wallClockDbTime);
        const payloadKb = (store.payloadBytes / 1024).toFixed(2);

        const lines = [
            `\n[API-PERFORMANCE]`,
            `Endpoint: ${store.method} ${store.url}`,
            `Status: ${res.statusCode} | Payload: ${payloadKb} KB | Cache: ${store.cacheStatus}`,
            `Connection: ${connTime.toFixed(1)}ms`,
            `Query (Sum): ${querySum.toFixed(1)}ms (${store.queryCount} queries)`,
            `DB Wall-Clock Span: ${wallClockDbTime.toFixed(1)}ms`,
        ];

        if (store.queries.length > 0) {
            store.queries.forEach((q, idx) => {
                const slowTag = q.isSlow ? " ⚠️ [SLOW QUERY]" : "";
                lines.push(`  - Query ${idx + 1} [${q.durationMs.toFixed(1)}ms]${slowTag}: ${q.sql}`);
            });
        }

        lines.push(`Controller: ${ctrlTime.toFixed(1)}ms`);
        lines.push(`Total: ${totalDuration.toFixed(1)}ms\n`);

        console.log(lines.join("\n"));
    });

    perfStorage.run(store, () => {
        next();
    });
}


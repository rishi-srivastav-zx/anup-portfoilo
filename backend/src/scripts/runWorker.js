import { connectDB } from "../config/db.js";
import { schedulerWorker } from "../workers/blogSchedulerWorker.js";

async function main() {
    console.log("🚀 Initializing Dedicated Blog Scheduler Worker Process...");
    await connectDB();

    // Start worker with 60-second polling interval
    schedulerWorker.start({ intervalMs: 60000 });
}

main().catch((err) => {
    console.error("❌ Fatal error in dedicated scheduler worker process:", err);
    process.exit(1);
});


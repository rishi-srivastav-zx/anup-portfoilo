import readline from "readline";
import argon2 from "argon2";
import { userRepository } from "../repositories/user.repository.js";
import { pool, connectDB } from "../config/db.js";

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.trim());
        })
    );
};

export const createAdmin = async () => {
    try {
        console.log("\n🔒 ==========================================");
        console.log("   SECURE ADMIN PROVISIONING UTILITY");
        console.log("==========================================\n");

        await connectDB();

        // Parse CLI arguments if provided, else check ENV, else prompt interactively
        const args = process.argv.slice(2);
        let name = "";
        let email = "";
        let password = "";

        for (let i = 0; i < args.length; i++) {
            if (args[i] === "--name" && args[i + 1]) name = args[i + 1];
            if (args[i] === "--email" && args[i + 1]) email = args[i + 1];
            if (args[i] === "--password" && args[i + 1]) password = args[i + 1];
        }

        if (!name) {
            name = process.env.ADMIN_NAME || (await askQuestion("👤 Enter Admin Full Name: "));
        }
        if (!email) {
            email = process.env.ADMIN_EMAIL || (await askQuestion("📧 Enter Admin Email: "));
        }
        if (!password) {
            password = process.env.ADMIN_PASSWORD || (await askQuestion("🔑 Enter Admin Password (min 10 chars): "));
        }

        // Validate inputs
        if (!name || name.length < 2) {
            console.error("❌ Name must be at least 2 characters.");
            process.exit(1);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            console.error("❌ Invalid email format.");
            process.exit(1);
        }

        if (!password || password.length < 10) {
            console.error("❌ Admin password must be at least 10 characters long.");
            process.exit(1);
        }

        // Check if account already exists
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            if (existing.role === "admin") {
                console.log(`⚠️ An admin account with email "${email}" already exists. No action taken.`);
            } else {
                console.error(`❌ A user account with email "${email}" already exists with role "${existing.role}". Cannot overwrite.`);
            }
            process.exit(0);
        }

        // Hash with Argon2id
        console.log("⏳ Hashing password securely using Argon2id...");
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        // Insert admin user
        const newAdmin = await userRepository.create({
            name,
            email,
            passwordHash,
            role: "admin",
        });

        console.log("\n✅ Admin account created successfully!");
        console.log(`   - ID: ${newAdmin.id}`);
        console.log(`   - Name: ${newAdmin.name}`);
        console.log(`   - Email: ${newAdmin.email}`);
        console.log(`   - Role: ${newAdmin.role}`);
        console.log(`   - Created At: ${newAdmin.created_at}\n`);
    } catch (err) {
        console.error("❌ Admin provisioning failed:", err.message);
        process.exit(1);
    } finally {
        await pool.end().catch(() => {});
        process.exit(0);
    }
};

createAdmin();

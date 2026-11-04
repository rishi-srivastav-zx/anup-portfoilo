import { pool } from "../config/db.js";
import { userRepository } from "../repositories/user.repository.js";

export const adminController = {
    async getDashboard(req, res, next) {
        try {
            // Combined SQL aggregation: aggregates user metrics and active sessions in a single database round-trip
            const metricsQuery = `
                SELECT
                    COUNT(*) AS total_users,
                    COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
                    COUNT(*) FILTER (WHERE is_active = true) AS active_users,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
                    (
                        SELECT COUNT(*)
                        FROM auth_sessions
                        WHERE is_revoked = false AND expires_at > NOW()
                    ) AS active_sessions
                FROM users;
            `;

            // Execute independent dashboard queries concurrently; avoid redundant COUNT(*) query
            const [metricsRes, usersData] = await Promise.all([
                pool.query(metricsQuery),
                userRepository.listUsers({ limit: 20, offset: 0, includeCount: false }),
            ]);

            const metrics = metricsRes.rows[0] || {};
            const totalUsers = parseInt(metrics.total_users || 0, 10);

            // Never cache administrative dashboard metrics
            res.setHeader(
                "Cache-Control",
                "private, no-cache, no-store, must-revalidate"
            );

            res.status(200).json({
                success: true,
                message: "Admin dashboard data retrieved successfully.",
                data: {
                    stats: {
                        totalUsers,
                        totalAdmins: parseInt(metrics.total_admins || 0, 10),
                        activeUsers: parseInt(metrics.active_users || 0, 10),
                        newUsers7d: parseInt(metrics.new_users_7d || 0, 10),
                        activeSessions: parseInt(metrics.active_sessions || 0, 10),
                    },
                    recentUsers: usersData.users,
                    totalUsersCount: totalUsers,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

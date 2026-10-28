import { pool } from "../config/db.js";
import { userRepository } from "../repositories/user.repository.js";

export const adminController = {
  
    async getDashboard(req, res, next) {
        try {
            const statsQuery = `
                SELECT
                    COUNT(*) AS total_users,
                    COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
                    COUNT(*) FILTER (WHERE is_active = true) AS active_users,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d
                FROM users;
            `;

            const activeSessionsQuery = `
                SELECT COUNT(*) AS active_sessions
                FROM auth_sessions
                WHERE is_revoked = false AND expires_at > NOW();
            `;

            const [statsRes, sessionsRes, usersData] = await Promise.all([
                pool.query(statsQuery),
                pool.query(activeSessionsQuery),
                userRepository.listUsers({ limit: 20, offset: 0 }),
            ]);

            res.status(200).json({
                success: true,
                message: "Admin dashboard data retrieved successfully.",
                data: {
                    stats: {
                        totalUsers: parseInt(statsRes.rows[0].total_users, 10),
                        totalAdmins: parseInt(statsRes.rows[0].total_admins, 10),
                        activeUsers: parseInt(statsRes.rows[0].active_users, 10),
                        newUsers7d: parseInt(statsRes.rows[0].new_users_7d, 10),
                        activeSessions: parseInt(
                            sessionsRes.rows[0].active_sessions,
                            10
                        ),
                    },
                    recentUsers: usersData.users,
                    totalUsersCount: usersData.total,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

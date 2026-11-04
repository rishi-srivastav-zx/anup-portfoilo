import { pool } from "../config/db.js";

export const userController = {
    /**
     * GET /api/user/dashboard
     * Returns dashboard data for the authenticated user
     */
    async getDashboard(req, res, next) {
        try {
            // Count total active sessions for this user
            const sessionCountRes = await pool.query(
                `SELECT COUNT(*) AS active_sessions FROM auth_sessions WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()`,
                [req.user.id]
            );

            res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");

            res.status(200).json({
                success: true,
                message: "User dashboard data retrieved.",
                data: {
                    user: req.user,
                    activeSessionsCount: parseInt(
                        sessionCountRes.rows[0].active_sessions,
                        10
                    ),
                    systemTime: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

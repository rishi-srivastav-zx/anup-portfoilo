/**
 * Middleware factory for role-based access control
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required before authorization.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to access this resource.",
            });
        }

        next();
    };
};

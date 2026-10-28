import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import {
    loginRateLimiter,
    registerRateLimiter,
    authGeneralLimiter,
} from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/authenticate.js";
import { verifyCsrfOrigin } from "../middleware/csrf.js";

const router = Router();

// Apply general auth rate limiter to all auth routes
router.use(authGeneralLimiter);

// Public routes
router.post(
    "/register",
    registerRateLimiter,
    validateRequest(registerSchema),
    authController.register
);

router.post(
    "/login",
    loginRateLimiter,
    validateRequest(loginSchema),
    authController.login
);

// Cookie-authenticated routes with CSRF origin validation
router.post("/refresh", verifyCsrfOrigin, authController.refresh);
router.post("/logout", verifyCsrfOrigin, authController.logout);
router.post("/logout-all", verifyCsrfOrigin, authenticate, authController.logoutAll);

// Protected profile endpoint
router.get("/me", authenticate, authController.me);

export default router;

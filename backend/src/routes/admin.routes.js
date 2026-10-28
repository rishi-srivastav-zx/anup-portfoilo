import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Strictly Admin-only routes
router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("admin"),
    adminController.getDashboard
);

export default router;

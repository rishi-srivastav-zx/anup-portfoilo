import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Protected user routes
router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("user", "admin"),
    userController.getDashboard
);

export default router;

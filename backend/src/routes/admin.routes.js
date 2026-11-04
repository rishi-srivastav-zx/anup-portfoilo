import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import portfolioKnowledgeRoutes from "./portfolioKnowledge.routes.js";
import adminLeadRoutes from "./adminLead.routes.js";

const router = Router();

// Strictly Admin-only routes
router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("admin"),
    adminController.getDashboard
);

// Dynamic Portfolio Knowledge Management Sub-Routes
router.use("/knowledge", portfolioKnowledgeRoutes);

// Lead Generation & Enquiry Management Sub-Routes
router.use("/leads", adminLeadRoutes);

export default router;

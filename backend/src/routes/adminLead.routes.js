/**
 * Admin Lead Management Routes
 * Step 10: Lead Generation & Enquiry Management System
 */

import { Router } from "express";
import { adminLeadController } from "../controllers/adminLead.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Protect all routes with admin authentication
router.use(authenticate, authorizeRoles("admin"));

/**
 * @route   GET /api/admin/leads
 * @desc    List and search leads with filtering and pagination
 * @access  Private (Admin)
 */
router.get("/", adminLeadController.listLeads);

/**
 * @route   GET /api/admin/leads/stats
 * @desc    Get aggregated lead metrics & pipeline counts
 * @access  Private (Admin)
 */
router.get("/stats", adminLeadController.getLeadStats);

/**
 * @route   GET /api/admin/leads/:id
 * @desc    Get detailed lead info with conversation history
 * @access  Private (Admin)
 */
router.get("/:id", adminLeadController.getLeadById);

/**
 * @route   PATCH /api/admin/leads/:id/status
 * @desc    Update lead pipeline status
 * @access  Private (Admin)
 */
router.patch("/:id/status", adminLeadController.updateLeadStatus);

/**
 * @route   PATCH /api/admin/leads/:id
 * @desc    Update lead fields
 * @access  Private (Admin)
 */
router.patch("/:id", adminLeadController.updateLead);

/**
 * @route   DELETE /api/admin/leads/:id
 * @desc    Delete lead record
 * @access  Private (Admin)
 */
router.delete("/:id", adminLeadController.deleteLead);

export default router;


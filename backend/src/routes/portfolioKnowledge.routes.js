import { Router } from "express";
import { portfolioKnowledgeController } from "../controllers/portfolioKnowledge.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validate.js";
import {
    createKnowledgeSchema,
    updateKnowledgeSchema,
    updateKnowledgeStatusSchema,
    knowledgeIdParamSchema,
    listKnowledgeQuerySchema,
    searchKnowledgeSchema,
} from "../validators/portfolioKnowledge.validator.js";

const router = Router();

// Apply admin authentication & authorization to all knowledge management endpoints
router.use(authenticate, authorizeRoles("admin"));

// POST /api/admin/knowledge/search - Test knowledge retrieval engine
router.post(
    "/search",
    validateRequest(searchKnowledgeSchema, "body"),
    portfolioKnowledgeController.handleSearchKnowledge
);

// GET /api/admin/knowledge/categories - Retrieve suggested and active categories
router.get("/categories", portfolioKnowledgeController.handleGetCategories);

// GET /api/admin/knowledge - List knowledge records with search, filters, pagination
router.get(
    "/",
    validateRequest(listKnowledgeQuerySchema, "query"),
    portfolioKnowledgeController.handleListKnowledge
);

// POST /api/admin/knowledge - Create a new knowledge record
router.post(
    "/",
    validateRequest(createKnowledgeSchema, "body"),
    portfolioKnowledgeController.handleCreateKnowledge
);

// GET /api/admin/knowledge/:id - Retrieve single knowledge record
router.get(
    "/:id",
    validateRequest(knowledgeIdParamSchema, "params"),
    portfolioKnowledgeController.handleGetKnowledgeById
);

// PUT /api/admin/knowledge/:id - Update an existing knowledge record
router.put(
    "/:id",
    validateRequest(knowledgeIdParamSchema, "params"),
    validateRequest(updateKnowledgeSchema, "body"),
    portfolioKnowledgeController.handleUpdateKnowledge
);

// PATCH /api/admin/knowledge/:id/status - Publish or unpublish a knowledge record
router.patch(
    "/:id/status",
    validateRequest(knowledgeIdParamSchema, "params"),
    validateRequest(updateKnowledgeStatusSchema, "body"),
    portfolioKnowledgeController.handleUpdateStatus
);

// DELETE /api/admin/knowledge/:id - Delete a knowledge record safely
router.delete(
    "/:id",
    validateRequest(knowledgeIdParamSchema, "params"),
    portfolioKnowledgeController.handleDeleteKnowledge
);

export default router;


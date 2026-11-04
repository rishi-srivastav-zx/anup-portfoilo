import { portfolioKnowledgeService } from "../services/portfolioKnowledge.service.js";
import { knowledgeRetrievalService } from "../services/knowledgeRetrieval.service.js";

/**
 * Controller for managing portfolio knowledge records
 */
export const portfolioKnowledgeController = {
    /**
     * POST /api/admin/knowledge
     * Creates a new knowledge record
     */
    async handleCreateKnowledge(req, res, next) {
        try {
            const data = await portfolioKnowledgeService.createKnowledge(req.body);
            return res.status(201).json({
                success: true,
                message: "Knowledge record created successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/knowledge
     * Lists knowledge records with search, filters, and pagination
     */
    async handleListKnowledge(req, res, next) {
        try {
            const queryParams = req.validatedQuery || req.query;
            const result = await portfolioKnowledgeService.listKnowledge(queryParams);
            return res.status(200).json({
                success: true,
                message: "Knowledge records retrieved successfully",
                data: result.items,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/knowledge/categories
     * Returns suggested and active categories
     */
    async handleGetCategories(req, res, next) {
        try {
            const data = await portfolioKnowledgeService.getCategories();
            return res.status(200).json({
                success: true,
                message: "Categories retrieved successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/knowledge/:id
     * Retrieves a single knowledge record
     */
    async handleGetKnowledgeById(req, res, next) {
        try {
            const { id } = req.params;
            const data = await portfolioKnowledgeService.getKnowledgeById(id);
            return res.status(200).json({
                success: true,
                message: "Knowledge record retrieved successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/knowledge/:id
     * Updates an existing knowledge record
     */
    async handleUpdateKnowledge(req, res, next) {
        try {
            const { id } = req.params;
            const data = await portfolioKnowledgeService.updateKnowledge(id, req.body);
            return res.status(200).json({
                success: true,
                message: "Knowledge record updated successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/knowledge/:id
     * Deletes a knowledge record safely
     */
    async handleDeleteKnowledge(req, res, next) {
        try {
            const { id } = req.params;
            await portfolioKnowledgeService.deleteKnowledge(id);
            return res.status(200).json({
                success: true,
                message: "Knowledge record deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/admin/knowledge/:id/status
     * Publishes, unpublishes, or archives a knowledge record
     */
    async handleUpdateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const data = await portfolioKnowledgeService.updateKnowledgeStatus(id, req.body);
            return res.status(200).json({
                success: true,
                message: "Knowledge status updated successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/knowledge/search
     * Tests knowledge retrieval engine against query, intent, and entities
     */
    async handleSearchKnowledge(req, res, next) {
        try {
            const { query, intent = null, entities = {}, limit = 5 } = req.body;
            const retrievalData = await knowledgeRetrievalService.retrieveKnowledge({
                query,
                intent,
                entities,
                limit,
            });

            return res.status(200).json({
                success: true,
                data: {
                    query: retrievalData.query,
                    results: retrievalData.results,
                    totalResults: retrievalData.totalResults,
                    hasRelevantKnowledge: retrievalData.hasRelevantKnowledge,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

export default portfolioKnowledgeController;

/**
 * Admin Lead Management Controller
 * Step 10: Lead Generation & Enquiry Management System
 */

import { leadService } from "../services/lead/lead.service.js";

export const adminLeadController = {
    /**
     * Lists leads with filtering, search, and pagination
     * GET /api/admin/leads
     */
    async listLeads(req, res, next) {
        try {
            const { status, projectType, search, startDate, endDate, page, limit } = req.query;

            const result = await leadService.listLeads({
                status,
                projectType,
                search,
                startDate,
                endDate,
                page,
                limit,
            });

            return res.status(200).json({
                success: true,
                data: result.leads,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Retrieves aggregated pipeline status metrics
     * GET /api/admin/leads/stats
     */
    async getLeadStats(req, res, next) {
        try {
            const stats = await leadService.getLeadStats();
            return res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Retrieves single lead by UUID with conversation logs
     * GET /api/admin/leads/:id
     */
    async getLeadById(req, res, next) {
        try {
            const { id } = req.params;
            const lead = await leadService.getLeadById(id);

            return res.status(200).json({
                success: true,
                data: lead,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Updates lead status
     * PATCH /api/admin/leads/:id/status
     */
    async updateLeadStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: { message: "Status field is required." },
                });
            }

            const updated = await leadService.updateLeadStatus(id, status);

            return res.status(200).json({
                success: true,
                message: "Lead status updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Updates full lead details
     * PATCH /api/admin/leads/:id
     */
    async updateLead(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await leadService.updateLead(id, req.body);

            return res.status(200).json({
                success: true,
                message: "Lead updated successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Deletes a lead
     * DELETE /api/admin/leads/:id
     */
    async deleteLead(req, res, next) {
        try {
            const { id } = req.params;
            const result = await leadService.deleteLead(id);

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default adminLeadController;


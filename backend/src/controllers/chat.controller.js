import { chatService } from "../services/chat.service.js";
import { leadService } from "../services/lead/lead.service.js";

/**
 * Controller for initializing a new chat conversation
 * POST /api/chat/conversation
 */
export const handleInitConversation = async (req, res, next) => {
    try {
        const { visitorId, metadata } = req.body || {};
        const result = await chatService.initializeConversation({
            visitorId,
            metadata,
        });

        return res.status(201).json({
            success: true,
            message: "Conversation initialized successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller for receiving a user message and returning structured reply
 * POST /api/chat/message
 */
export const handleSendMessage = async (req, res, next) => {
    try {
        const { conversationId, message, action, actionPayload } = req.body;
        const visitorToken = req.visitorToken || null;

        const data = await chatService.processMessage({
            conversationId,
            message,
            visitorToken,
            action,
            actionPayload,
        });

        return res.status(200).json({
            success: true,
            message: "Message processed successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller for direct lead enquiry submission
 * POST /api/chat/lead
 */
export const handleCreateLead = async (req, res, next) => {
    try {
        const {
            conversationId,
            visitorName,
            phone,
            projectType,
            projectDescription,
            email,
            budget,
            preferredDate,
            location,
            source,
        } = req.body;
        const visitorToken = req.visitorToken || null;

        const result = await leadService.submitDirectLead({
            conversationId,
            visitorToken,
            payload: {
                visitorName,
                phone,
                projectType,
                projectDescription,
                email,
                budget,
                preferredDate,
                location,
                source,
            },
        });

        return res.status(201).json({
            success: true,
            message: result.message,
            data: {
                lead: result.lead,
                referenceId: result.referenceId,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller for retrieving conversation details and history
 * GET /api/chat/conversation/:conversationId
 */
export const handleGetConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const visitorToken = req.visitorToken || null;

        const data = await chatService.getConversation({
            conversationId,
            visitorToken,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation retrieved successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller for deleting a conversation
 * DELETE /api/chat/conversation/:conversationId
 */
export const handleDeleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const visitorToken = req.visitorToken || null;

        await chatService.deleteConversation({
            conversationId,
            visitorToken,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};


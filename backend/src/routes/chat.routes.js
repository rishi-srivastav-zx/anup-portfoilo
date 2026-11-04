import { Router } from "express";
import { validateRequest } from "../middleware/validate.js";
import {
    chatMessageLimiter,
    chatConversationLimiter,
} from "../middleware/rateLimiter.js";
import { smartChatMessageLimiter } from "../middleware/chatRateLimit.middleware.js";
import {
    extractVisitorToken,
    enforceChatPayloadLimit,
} from "../middleware/chat.middleware.js";
import {
    createConversationSchema,
    sendMessageSchema,
    createLeadSchema,
    conversationIdParamSchema,
} from "../validators/chat.validator.js";
import {
    handleInitConversation,
    handleSendMessage,
    handleCreateLead,
    handleGetConversation,
    handleDeleteConversation,
} from "../controllers/chat.controller.js";

const router = Router();

// Apply visitor token extraction and payload limit protection across all chat endpoints
router.use(extractVisitorToken);
router.use(enforceChatPayloadLimit(32 * 1024)); // 32KB max JSON payload

/**
 * @route   POST /api/chat/conversation
 * @desc    Initialize a new conversation session
 * @access  Public
 */
router.post(
    "/conversation",
    chatConversationLimiter,
    validateRequest(createConversationSchema, "body"),
    handleInitConversation
);

/**
 * @route   POST /api/chat/message
 * @desc    Submit user message and receive structured response
 * @access  Public
 */
router.post(
    "/message",
    validateRequest(sendMessageSchema, "body"),
    smartChatMessageLimiter,
    handleSendMessage
);

/**
 * @route   POST /api/chat/lead
 * @desc    Submit lead enquiry directly from chat UI
 * @access  Public
 */
router.post(
    "/lead",
    chatMessageLimiter,
    validateRequest(createLeadSchema, "body"),
    handleCreateLead
);

/**
 * @route   GET /api/chat/conversation/:conversationId
 * @desc    Retrieve conversation details and message history
 * @access  Public (Owner token validated if present)
 */
router.get(
    "/conversation/:conversationId",
    validateRequest(conversationIdParamSchema, "params"),
    handleGetConversation
);

/**
 * @route   DELETE /api/chat/conversation/:conversationId
 * @desc    Delete a conversation and all its messages
 * @access  Public (Owner token validated if present)
 */
router.delete(
    "/conversation/:conversationId",
    validateRequest(conversationIdParamSchema, "params"),
    handleDeleteConversation
);

export default router;


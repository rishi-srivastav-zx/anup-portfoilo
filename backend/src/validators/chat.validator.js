import { z } from "zod";

/**
 * Schema for initializing a conversation
 * Accepts optional visitor identification and metadata
 */
export const createConversationSchema = z.object({
    visitorId: z
        .string()
        .trim()
        .max(100, "visitorId cannot exceed 100 characters")
        .optional()
        .nullable(),
    metadata: z
        .record(z.any())
        .optional()
        .default({}),
});

/**
 * Schema for incoming user message
 * Validates required message, min/max length, and UUID conversationId
 */
export const sendMessageSchema = z.object({
    conversationId: z
        .string({
            required_error: "conversationId is required",
            invalid_type_error: "conversationId must be a string",
        })
        .uuid("conversationId must be a valid UUID"),
    message: z
        .string({
            required_error: "message is required",
            invalid_type_error: "message must be a string",
        })
        .trim()
        .min(1, "message cannot be empty")
        .max(2000, "message must not exceed 2000 characters"),
    action: z.string().optional().nullable(),
    actionPayload: z.record(z.any()).optional().nullable(),
});

/**
 * Schema for direct public lead submission
 * Step 10: Lead Generation & Enquiry Management
 */
export const createLeadSchema = z.object({
    conversationId: z.string().uuid("conversationId must be a valid UUID"),
    visitorName: z.string({ required_error: "visitorName is required" }).trim().min(2, "visitorName must be at least 2 characters").max(100),
    phone: z.string({ required_error: "phone is required" }).trim().min(7, "phone must be at least 7 characters").max(30),
    projectType: z.string().trim().max(100).optional().nullable(),
    projectDescription: z.string().trim().max(2000).optional().nullable(),
    email: z.string().trim().email("Invalid email address").optional().nullable(),
    budget: z.string().trim().max(100).optional().nullable(),
    preferredDate: z.string().trim().max(100).optional().nullable(),
    location: z.string().trim().max(100).optional().nullable(),
    source: z.string().trim().max(100).optional().nullable(),
});

/**
 * Schema for validating URL parameter :conversationId
 */
export const conversationIdParamSchema = z.object({
    conversationId: z
        .string({
            required_error: "conversationId parameter is required",
        })
        .uuid("conversationId parameter must be a valid UUID"),
});


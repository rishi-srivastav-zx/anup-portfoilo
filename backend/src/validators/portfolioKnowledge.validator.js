import { z } from "zod";
import { KNOWLEDGE_STATUS } from "../constants/portfolioKnowledge.constants.js";

const VALID_STATUSES = [
    KNOWLEDGE_STATUS.DRAFT,
    KNOWLEDGE_STATUS.PUBLISHED,
    KNOWLEDGE_STATUS.ARCHIVED,
];

/**
 * Validates request payload for creating a new knowledge item
 */
export const createKnowledgeSchema = z.object({
    title: z
        .string({
            required_error: "title is required",
            invalid_type_error: "title must be a string",
        })
        .trim()
        .min(1, "title cannot be empty")
        .max(255, "title cannot exceed 255 characters"),
    content: z
        .string({
            required_error: "content is required",
            invalid_type_error: "content must be a string",
        })
        .trim()
        .min(1, "content cannot be empty"),
    category: z
        .string({
            required_error: "category is required",
            invalid_type_error: "category must be a string",
        })
        .trim()
        .min(1, "category cannot be empty")
        .max(100, "category cannot exceed 100 characters"),
    projectName: z
        .string()
        .trim()
        .max(255, "projectName cannot exceed 255 characters")
        .optional()
        .nullable(),
    keywords: z
        .array(z.string().trim())
        .optional()
        .default([]),
    metadata: z
        .record(z.any())
        .optional()
        .default({}),
    status: z
        .enum(VALID_STATUSES, {
            errorMap: () => ({ message: "status must be 'draft', 'published', or 'archived'" }),
        })
        .optional(),
    isPublished: z
        .boolean({ invalid_type_error: "isPublished must be a boolean" })
        .optional(),
});

/**
 * Validates request payload for updating an existing knowledge item
 */
export const updateKnowledgeSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "title cannot be empty")
        .max(255, "title cannot exceed 255 characters")
        .optional(),
    content: z
        .string()
        .trim()
        .min(1, "content cannot be empty")
        .optional(),
    category: z
        .string()
        .trim()
        .min(1, "category cannot be empty")
        .max(100, "category cannot exceed 100 characters")
        .optional(),
    projectName: z
        .string()
        .trim()
        .max(255, "projectName cannot exceed 255 characters")
        .optional()
        .nullable(),
    keywords: z
        .array(z.string().trim())
        .optional(),
    metadata: z
        .record(z.any())
        .optional(),
    status: z
        .enum(VALID_STATUSES, {
            errorMap: () => ({ message: "status must be 'draft', 'published', or 'archived'" }),
        })
        .optional(),
    isPublished: z
        .boolean({ invalid_type_error: "isPublished must be a boolean" })
        .optional(),
});

/**
 * Validates request payload for publishing/unpublishing/updating status
 */
export const updateKnowledgeStatusSchema = z
    .object({
        status: z
            .enum(VALID_STATUSES, {
                errorMap: () => ({ message: "status must be 'draft', 'published', or 'archived'" }),
            })
            .optional(),
        is_published: z.boolean().optional(),
        isPublished: z.boolean().optional(),
    })
    .refine(
        (data) =>
            data.status !== undefined ||
            data.is_published !== undefined ||
            data.isPublished !== undefined,
        {
            message: "Must provide either 'status' or 'is_published' / 'isPublished'",
        }
    );

/**
 * Validates UUID URL parameter
 */
export const knowledgeIdParamSchema = z.object({
    id: z
        .string({
            required_error: "id parameter is required",
        })
        .uuid("id parameter must be a valid UUID"),
});

/**
 * Validates query parameters for listing knowledge items
 */
export const listKnowledgeQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    status: z.enum([...VALID_STATUSES, "all"]).optional(),
    isPublished: z.preprocess((val) => {
        if (typeof val === "string") {
            if (val.toLowerCase() === "true") return true;
            if (val.toLowerCase() === "false") return false;
        }
        return val;
    }, z.boolean().optional()),
    projectName: z.string().trim().optional(),
});

/**
 * Validates search request payload for knowledge retrieval
 */
export const searchKnowledgeSchema = z.object({
    query: z
        .string({
            required_error: "query is required",
            invalid_type_error: "query must be a string",
        })
        .trim()
        .min(1, "query cannot be empty"),
    intent: z.string().trim().optional().nullable(),
    entities: z.record(z.any()).optional().default({}),
    limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});


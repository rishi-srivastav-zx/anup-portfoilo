import { z } from "zod";

/**
 * Zod schema for a single blog record in a bulk import payload.
 */
export const blogImportItemSchema = z.object({
    title: z
        .string({ required_error: "Title is required" })
        .trim()
        .min(1, "Title must be at least 1 character")
        .max(255, "Title must not exceed 255 characters"),
    slug: z
        .string()
        .trim()
        .max(255, "Slug must not exceed 255 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
        .optional()
        .nullable(),
    excerpt: z.string().trim().max(1000, "Excerpt must not exceed 1000 characters").optional().default(""),
    category: z.string().trim().max(100, "Category must not exceed 100 characters").optional().default("Cinematography"),
    tags: z
        .union([
            z.array(z.string().trim()),
            z.string().transform((val) => val.split(",").map((t) => t.trim()).filter(Boolean)),
        ])
        .optional()
        .default([]),
    author: z
        .object({
            name: z.string().trim().default("Anup Rawat"),
            role: z.string().trim().default("Cinematographer & Visual Storyteller"),
        })
        .optional()
        .default({
            name: "Anup Rawat",
            role: "Cinematographer & Visual Storyteller",
        }),
    featuredImage: z
        .string()
        .trim()
        .refine(
            (val) => !val || /^(https?:\/\/|\/)/i.test(val),
            "featuredImage must be a valid http(s) URL or relative path starting with '/'"
        )
        .optional()
        .default(""),
    featuredImageAlt: z.string().trim().max(255).optional().default(""),
    featuredImageFileId: z.string().trim().optional().nullable(),
    galleryImages: z.array(z.any()).optional().default([]),
    readingTime: z.string().trim().optional(),
    isFeatured: z.boolean().optional().default(false),
    layoutVariant: z.enum(["wide", "standard"]).optional().default("wide"),
    technicalNote: z.string().trim().optional().nullable().default(""),
    introduction: z
        .union([
            z.array(z.string()),
            z.string().transform((val) => val ? [val] : []),
        ])
        .optional()
        .default([]),
    content: z.string().optional().default(""),
    sections: z.array(z.any()).optional().default([]),
    seoTitle: z.string().trim().max(255).optional().nullable(),
    seoDescription: z.string().trim().max(500).optional().nullable(),
    seoKeywords: z.string().trim().optional().nullable(),
    canonicalUrl: z
        .string()
        .trim()
        .refine(
            (val) => !val || /^https?:\/\//i.test(val),
            "canonicalUrl must be a valid absolute http(s) URL"
        )
        .optional()
        .nullable(),
    scheduledAt: z
        .string()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "scheduledAt must be a valid ISO-8601 date string"
        )
        .optional()
        .nullable(),
});

/**
 * Schema for bulk import execution options.
 */
export const bulkImportOptionsSchema = z.object({
    allowPartial: z.boolean().optional().default(false),
    autoDisambiguateSlugs: z.boolean().optional().default(false),
    startPublishAt: z
        .string()
        .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "startPublishAt must be a valid ISO-8601 date string"
        )
        .optional()
        .nullable(),
    publishingIntervalMinutes: z
        .number()
        .int()
        .min(5)
        .max(1440)
        .optional(),
});

export default {
    blogImportItemSchema,
    bulkImportOptionsSchema,
};


import { z } from "zod";

export const blogSubSectionSchema = z.object({
    title: z.string().trim().min(1, "Subsection title is required"),
    paragraphs: z.array(z.string()).default([""]),
});

export const blogPullQuoteSchema = z
    .object({
        text: z.string().trim(),
        context: z.string().trim().optional().default(""),
    })
    .nullable()
    .optional();

export const blogInlineImageSchema = z
    .object({
        src: z.string().trim(),
        alt: z.string().trim().default(""),
        caption: z.string().trim().optional().default(""),
    })
    .nullable()
    .optional();

export const blogTableSchema = z
    .object({
        caption: z.string().trim().default(""),
        headers: z.array(z.string()).default([]),
        rows: z.array(z.array(z.string())).default([]),
    })
    .nullable()
    .optional();

export const blogSectionSchema = z.object({
    id: z.string().optional(),
    heading: z.string().trim().min(1, "Section heading is required"),
    paragraphs: z.array(z.string()).default([""]),
    subSections: z.array(blogSubSectionSchema).optional().default([]),
    pullQuote: blogPullQuoteSchema,
    inlineImage: blogInlineImageSchema,
    table: blogTableSchema,
    checklist: z.array(z.string()).nullable().optional(),
});

export const createBlogSchema = z.object({
    title: z
        .string({ required_error: "Article title is required" })
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
    excerpt: z.string().trim().optional().default(""),
    category: z.string().trim().optional().default("Cinematography"),
    tags: z.array(z.string()).default([]),
    author: z
        .object({
            name: z.string().trim().optional().default("Anup Rawat"),
            role: z.string().trim().optional().default("Cinematographer & Visual Storyteller"),
        })
        .optional()
        .default({
            name: "Anup Rawat",
            role: "Cinematographer & Visual Storyteller",
        }),
    featuredImage: z.string().trim().optional().nullable().default(""),
    featuredImageAlt: z.string().trim().optional().nullable().default(""),
    featuredImageFileId: z.string().trim().optional().nullable(),
    galleryImages: z.array(z.any()).optional().default([]),
    readingTime: z.string().trim().optional().default("1 min read"),
    status: z.enum(["draft", "published"]).default("draft"),
    isFeatured: z.boolean().default(false),
    layoutVariant: z.enum(["wide", "standard"]).default("wide"),
    technicalNote: z.string().trim().optional().nullable().default(""),
    introduction: z.array(z.string()).default([]),
    content: z.string().optional().nullable().default(""),
    sections: z.array(blogSectionSchema).default([]),
    seoTitle: z.string().trim().max(255).optional().nullable(),
    seoDescription: z.string().trim().optional().nullable(),
    seoKeywords: z.string().trim().optional().nullable(),
    canonicalUrl: z.string().trim().optional().nullable(),
    publishedAt: z.string().optional().nullable(),
});

export const updateBlogSchema = createBlogSchema.partial();


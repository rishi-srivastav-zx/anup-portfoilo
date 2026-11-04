import { z } from "zod";

export const createEnquirySchema = z.object({
    name: z
        .string({ required_error: "Full name is compulsory" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(150, "Name must not exceed 150 characters"),
    phone: z
        .string({ required_error: "Phone or WhatsApp number is compulsory" })
        .trim()
        .min(7, "Phone number must be at least 7 digits")
        .max(30, "Phone number is too long"),
    message: z
        .string()
        .trim()
        .max(4000, "Message must not exceed 4000 characters")
        .optional()
        .default(""),
    email: z
        .string()
        .trim()
        .max(255)
        .optional()
        .nullable(),
    project_type: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),
    source: z.string().trim().optional().default("Portfolio Contact Form"),
});

export const updateEnquiryStatusSchema = z.object({
    status: z.enum(["New", "Contacted", "In Discussion", "Confirmed", "Closed"], {
        errorMap: () => ({ message: "Invalid lead status" }),
    }),
});

import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string({ required_error: "Name is required" })
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name must not exceed 100 characters"),
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .toLowerCase()
            .email("Please provide a valid email address")
            .max(255, "Email must not exceed 255 characters"),
        password: z
            .string({ required_error: "Password is required" })
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must not exceed 128 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter"
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter"
            )
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string({
            required_error: "Confirm password is required",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),
    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required"),
});

/**
 * Lead Validation & Normalization Service
 * Ensures reliable capture of client inquiries without spam or broken numbers.
 */

/**
 * Validates and normalizes client full name
 * @param {string} name
 * @returns {{ isValid: boolean, value: string, error?: string }}
 */
export function validateName(name) {
    if (!name || typeof name !== "string") {
        return { isValid: false, value: "", error: "Please share your name so Anup knows who he is speaking with." };
    }

    const trimmed = name.trim().replace(/\s+/g, " ");

    if (trimmed.length < 2) {
        return { isValid: false, value: trimmed, error: "Name must be at least 2 characters long." };
    }

    if (trimmed.length > 100) {
        return { isValid: false, value: trimmed.slice(0, 100), error: "Name must not exceed 100 characters." };
    }

    // Must not be purely digits or special characters
    if (/^[\d\W]+$/.test(trimmed)) {
        return { isValid: false, value: trimmed, error: "Please provide a valid name containing letters." };
    }

    // Extract name if phrase like "my name is Rahul" or "I am Rahul"
    let candidate = trimmed;
    const prefixMatch = candidate.match(/^(?:my\s+name\s+is|i\s+am|i'm|this\s+is|call\s+me)\s+([a-zA-Z\s]{2,50})$/i);
    if (prefixMatch) {
        candidate = prefixMatch[1].trim();
    }

    if (candidate.length < 2) {
        return { isValid: false, value: candidate, error: "Name must be at least 2 characters long." };
    }

    // Simple formatting: capitalize words
    const formatted = candidate
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    return { isValid: true, value: formatted };
}

/**
 * Validates and normalizes phone / WhatsApp numbers (India & International)
 * Strict validation: Indian mobile numbers must be exactly 10 digits (starting with 6, 7, 8, or 9).
 * Rejects letters, spaces-only values, incomplete numbers, and invalid formats.
 * Accepts formats:
 * - 9876543210
 * - +91 9876543210 / +91-98765-43210
 * - 09876543210
 * - International: +1 415 555 2671, +44 7911 123456, etc.
 * @param {string} phone
 * @returns {{ isValid: boolean, value: string, error?: string }}
 */
export function validatePhone(phone) {
    if (!phone || typeof phone !== "string") {
        return { isValid: false, value: "", error: "Please enter a valid 10-digit mobile or WhatsApp number." };
    }

    const trimmed = phone.trim();
    if (!trimmed) {
        return { isValid: false, value: "", error: "Please enter a valid 10-digit mobile or WhatsApp number." };
    }

    // Reject letters or alphabetic text
    if (/[a-zA-Z]/.test(trimmed)) {
        return {
            isValid: false,
            value: trimmed,
            error: "Phone number cannot contain letters. Please enter a valid 10-digit mobile number.",
        };
    }

    // Clean out spaces, dashes, parentheses, dots
    const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, "");

    // Check Indian 10-digit number (starts with 6, 7, 8, or 9)
    const indian10Regex = /^[6-9]\d{9}$/;
    if (indian10Regex.test(cleaned)) {
        return { isValid: true, value: `+91${cleaned}` };
    }

    // Check Indian 11-digit starting with 0
    if (/^0[6-9]\d{9}$/.test(cleaned)) {
        return { isValid: true, value: `+91${cleaned.slice(1)}` };
    }

    // Check Indian with country code: +919876543210 or 919876543210
    if (/^(\+?91)([6-9]\d{9})$/.test(cleaned)) {
        const matches = cleaned.match(/^(\+?91)([6-9]\d{9})$/);
        return { isValid: true, value: `+91${matches[2]}` };
    }

    // Check standard international format with '+' (E.164: 7 to 15 digits)
    if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
        return { isValid: true, value: cleaned };
    }

    return {
        isValid: false,
        value: trimmed,
        error: "Please enter a valid 10-digit mobile or WhatsApp number (e.g., 9876543210) so Anup can reach you.",
    };
}

/**
 * Validates email address (optional or required)
 * @param {string} email
 * @returns {{ isValid: boolean, value: string, error?: string }}
 */
export function validateEmail(email) {
    if (!email || typeof email !== "string" || !email.trim()) {
        return { isValid: true, value: "" }; // Optional
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return { isValid: false, value: trimmed, error: "Please enter a valid email address." };
    }

    return { isValid: true, value: trimmed };
}

/**
 * Validates project type
 * @param {string} projectType
 * @returns {{ isValid: boolean, value: string, error?: string }}
 */
export function validateProjectType(projectType) {
    if (!projectType || typeof projectType !== "string") {
        return { isValid: false, value: "", error: "Please specify the project type (e.g., Commercial, Music Video, Brand Film, Documentary)." };
    }

    const trimmed = projectType.trim();

    if (trimmed.length < 2) {
        return { isValid: false, value: trimmed, error: "Project type is too short (minimum 2 characters)." };
    }

    if (trimmed.length > 100) {
        return { isValid: false, value: trimmed.slice(0, 100), error: "Project type must not exceed 100 characters." };
    }

    return { isValid: true, value: trimmed };
}

/**
 * Validates project description / requirements
 * @param {string} description
 * @returns {{ isValid: boolean, value: string, error?: string }}
 */
export function validateProjectDescription(description) {
    if (!description || typeof description !== "string") {
        return { isValid: false, value: "", error: "Please share a brief note about the project, shoot dates, or expectations." };
    }

    const trimmed = description.trim();

    if (trimmed.length < 3) {
        return { isValid: false, value: trimmed, error: "Please provide a bit more detail (at least 3 characters)." };
    }

    if (trimmed.length > 2000) {
        return { isValid: false, value: trimmed.slice(0, 2000), error: "Description must not exceed 2000 characters." };
    }

    return { isValid: true, value: trimmed };
}

/**
 * Validates complete lead submission payload
 * @param {object} leadData
 * @returns {{ isValid: boolean, normalizedData: object, errors: object }}
 */
export function validateLeadPayload(leadData = {}) {
    const errors = {};
    const normalizedData = {};

    // 1. Name (Required)
    const nameResult = validateName(leadData.visitorName || leadData.name);
    if (!nameResult.isValid) {
        errors.visitorName = nameResult.error;
    } else {
        normalizedData.visitorName = nameResult.value;
    }

    // 2. Phone (Required)
    const phoneResult = validatePhone(leadData.phone || leadData.phoneNumber);
    if (!phoneResult.isValid) {
        errors.phone = phoneResult.error;
    } else {
        normalizedData.phone = phoneResult.value;
    }

    // 3. Project Type (Optional, nullable, but if a non-null string is provided it must be valid)
    const rawProjectType = leadData.projectType;
    if (rawProjectType !== undefined && rawProjectType !== null) {
        if (typeof rawProjectType === "string" && rawProjectType.trim().toLowerCase() === "not specified") {
            normalizedData.projectType = null;
        } else {
            const projectTypeResult = validateProjectType(rawProjectType);
            if (!projectTypeResult.isValid) {
                errors.projectType = projectTypeResult.error;
            } else {
                normalizedData.projectType = projectTypeResult.value;
            }
        }
    } else {
        normalizedData.projectType = null;
    }

    // 4. Project Description (Optional, nullable, but if a non-null string is provided it must be valid)
    const rawDesc = leadData.projectDescription !== undefined
        ? leadData.projectDescription
        : (leadData.description !== undefined ? leadData.description : leadData.message);

    if (rawDesc !== undefined && rawDesc !== null) {
        if (typeof rawDesc === "string" && rawDesc.trim().toLowerCase() === "not specified") {
            normalizedData.projectDescription = null;
        } else {
            const descResult = validateProjectDescription(rawDesc);
            if (!descResult.isValid) {
                errors.projectDescription = descResult.error;
            } else {
                normalizedData.projectDescription = descResult.value;
            }
        }
    } else {
        normalizedData.projectDescription = null;
    }

    // 5. Email (Optional)
    if (leadData.email) {
        const emailResult = validateEmail(leadData.email);
        if (!emailResult.isValid) {
            errors.email = emailResult.error;
        } else {
            normalizedData.email = emailResult.value;
        }
    } else {
        normalizedData.email = null;
    }

    // 6. Budget (Optional)
    if (leadData.budget) {
        normalizedData.budget = String(leadData.budget).trim().slice(0, 100);
    } else {
        normalizedData.budget = null;
    }

    // 7. Preferred Date (Optional)
    if (leadData.preferredDate || leadData.date) {
        normalizedData.preferredDate = String(leadData.preferredDate || leadData.date).trim().slice(0, 100);
    } else {
        normalizedData.preferredDate = null;
    }

    // 8. Location (Optional)
    if (leadData.location) {
        normalizedData.location = String(leadData.location).trim().slice(0, 100);
    } else {
        normalizedData.location = null;
    }

    // 9. Source (Optional)
    normalizedData.source = leadData.source || "AI Chat Assistant";

    return {
        isValid: Object.keys(errors).length === 0,
        normalizedData,
        errors,
    };
}


import sanitizeHtmlLib from "sanitize-html";

/**
 * Editorial Allowlist Configuration for Blog Content
 * Restricts HTML exclusively to safe typographic, structural, and media elements.
 * Explicitly rejects script, iframe, object, embed, form, SVG, MathML, templates,
 * and dangerous URI protocols (javascript:, data:, vbscript:).
 */
const EDITORIAL_SANITIZE_OPTIONS = {
    allowedTags: [
        "p", "h1", "h2", "h3", "h4", "h5", "h6",
        "strong", "b", "em", "i", "u", "strike", "s",
        "blockquote", "code", "pre", "ul", "ol", "li",
        "a", "img", "span", "div", "br", "hr",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td",
        "figure", "figcaption", "caption",
    ],
    allowedAttributes: {
        a: ["href", "name", "target", "rel", "title"],
        img: ["src", "alt", "title", "width", "height", "loading"],
        "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
        a: ["http", "https", "mailto"],
        img: ["http", "https", "data"],
    },
    disallowedTagsMode: "discard",
    transformTags: {
        a: (tagName, attribs) => {
            const cleanAttribs = { ...attribs };
            if (cleanAttribs.target === "_blank") {
                cleanAttribs.rel = "noopener noreferrer";
            }
            return {
                tagName: "a",
                attribs: cleanAttribs,
            };
        },
        img: (tagName, attribs) => {
            const cleanAttribs = { ...attribs };
            if (cleanAttribs.src && cleanAttribs.src.startsWith("data:")) {
                // Strictly permit raster bitmaps only; discard scriptable SVG data URIs
                if (!/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(cleanAttribs.src)) {
                    delete cleanAttribs.src;
                }
            }
            return {
                tagName: "img",
                attribs: cleanAttribs,
            };
        },
    },
};

/**
 * Sanitizes an HTML string to ensure safe storage and rendering.
 * Uses robust AST/token allowlist parser to neutralize XSS, malformed markup,
 * entity-encoded protocol evasions, and inline event triggers.
 *
 * @param {string} html 
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
    if (typeof html !== "string") return "";
    // Pre-clean: strip null bytes and unclosed dangerous tags before AST parsing
    const preClean = html
        .replace(/\0/g, "")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<script\b[^>]*\/?>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<style\b[^>]*\/?>/gi, "")
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
        .replace(/<iframe\b[^>]*\/?>/gi, "");

    return sanitizeHtmlLib(preClean, EDITORIAL_SANITIZE_OPTIONS).trim();
}

/**
 * Disarms CSV / Excel formula injection by prepending a single quote
 * if a string begins with formula triggers (=, +, -, @, tab, CR, pipe).
 * NOTE: This is an export-boundary defense and should NEVER be applied to
 * stored database content (titles, excerpts, content).
 *
 * @param {string} str
 * @returns {string}
 */
export function sanitizeCsvFormula(str) {
    if (typeof str !== "string") return str;
    const trimmed = str.trimStart();
    if (/^[-=+@|\t\r]/.test(trimmed)) {
        return `'${str}`;
    }
    return str;
}

/**
 * Helper for formatting cells when exporting datasets to CSV
 */
export function formatCsvCell(val) {
    if (val === null || val === undefined) return "";
    const strVal = String(val);
    const sanitized = sanitizeCsvFormula(strVal);
    if (sanitized.includes(",") || sanitized.includes('"') || sanitized.includes("\n") || sanitized.includes("\r")) {
        return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
}

/**
 * Recursively redacts sensitive fields (passwords, tokens, cookies, secrets)
 * from objects before logging or returning error details.
 */
export function redactSensitiveData(data) {
    if (!data) return data;
    if (typeof data === "string") {
        return data
            .replace(/(token|secret|password|bearer|cookie)=([^&\s]+)/gi, "$1=[REDACTED]")
            .replace(/:([^:@]+)@/, ":[REDACTED]@"); // Redact connection string passwords
    }
    if (Array.isArray(data)) {
        return data.map(redactSensitiveData);
    }
    if (typeof data === "object") {
        const clean = {};
        for (const [k, v] of Object.entries(data)) {
            if (/password|token|secret|cookie|authorization/i.test(k)) {
                clean[k] = "[REDACTED]";
            } else {
                clean[k] = redactSensitiveData(v);
            }
        }
        return clean;
    }
    return data;
}

/**
 * Recursively sanitizes strings inside objects or arrays.
 */
export function sanitizeDeep(input) {
    if (typeof input === "string") {
        return sanitizeHtml(input);
    }
    if (Array.isArray(input)) {
        return input.map(sanitizeDeep);
    }
    if (input && typeof input === "object") {
        const out = {};
        for (const [k, v] of Object.entries(input)) {
            out[k] = sanitizeDeep(v);
        }
        return out;
    }
    return input;
}

export default { sanitizeHtml, sanitizeCsvFormula, formatCsvCell, redactSensitiveData, sanitizeDeep };


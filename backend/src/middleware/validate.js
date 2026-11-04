
export const validateRequest = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formattedErrors,
            });
        }

        // Assign sanitized data back to the request
        if (source === "body") {
            req.body = result.data;
        } else if (source === "params") {
            req.params = Object.assign({}, req.params, result.data);
        } else if (source === "query") {
            req.validatedQuery = result.data;
            try {
                Object.assign(req.query, result.data);
            } catch {
                // In Express 5 req.query may be getter-only
            }
        }
        next();
    };
};

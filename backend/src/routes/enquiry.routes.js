import { Router } from "express";
import { validateRequest } from "../middleware/validate.js";
import {
    createEnquirySchema,
    updateEnquiryStatusSchema,
} from "../validators/enquiry.validator.js";
import { enquiryRateLimiter } from "../middleware/rateLimiter.js";
import {
    handleCreateEnquiry,
    handleGetEnquiries,
    handleUpdateEnquiryStatus,
    handleDeleteEnquiry,
} from "../controllers/enquiry.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = Router();

// Public lead submission (validated: name & phone compulsory, rate-limited)
router.post(
    "/",
    enquiryRateLimiter,
    validateRequest(createEnquirySchema),
    handleCreateEnquiry
);

// Admin retrieval of all submitted leads
router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    handleGetEnquiries
);

// Admin update lead status (New, Contacted, In Discussion, Confirmed, Closed)
router.patch(
    "/:id/status",
    authenticate,
    authorizeRoles("admin"),
    validateRequest(updateEnquiryStatusSchema),
    handleUpdateEnquiryStatus
);

// Admin delete lead
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    handleDeleteEnquiry
);

export default router;

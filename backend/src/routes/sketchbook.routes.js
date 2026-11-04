import { Router } from "express";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
    handleGetSketchbookImages,
    handleUploadSketchbookImage,
    handleDeleteSketchbookImage,
    handleReorderSketchbookImages,
} from "../controllers/sketchbook.controller.js";

const router = Router();

// Public: retrieve up to 10 curated images for the Infinite Pages gallery
router.get("/", handleGetSketchbookImages);

// Admin: upload new sketchbook image (converts to WebP, limits to max 10)
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    uploadImage,
    handleUploadSketchbookImage
);

// Admin: reorder images
router.put(
    "/reorder",
    authenticate,
    authorizeRoles("admin"),
    handleReorderSketchbookImages
);

// Admin: delete image by ID
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    handleDeleteSketchbookImage
);

export default router;


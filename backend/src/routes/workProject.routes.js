import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
    handleGetWorkProjects,
    handleGetWorkProjectById,
    handleCreateWorkProject,
    handleUpdateWorkProject,
    handleDeleteWorkProject,
    handleReorderWorkProjects,
} from "../controllers/workProject.controller.js";

const router = Router();

const projectUpload = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

// Public: get all work projects
router.get("/", handleGetWorkProjects);

// Public: get project by id
router.get("/:id", handleGetWorkProjectById);

// Admin: create project with video (max 80MB) & thumbnail
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    projectUpload,
    handleCreateWorkProject
);

// Admin: reorder projects
router.put(
    "/reorder",
    authenticate,
    authorizeRoles("admin"),
    handleReorderWorkProjects
);

// Admin: update project
router.put(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    projectUpload,
    handleUpdateWorkProject
);

// Admin: delete project
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    handleDeleteWorkProject
);

export default router;


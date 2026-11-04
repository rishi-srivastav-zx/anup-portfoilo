import * as workProjectRepository from "../repositories/workProject.repository.js";
import { uploadMedia, deleteMedia } from "../modules/image.service.js";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80MB strictly enforced

export const handleGetWorkProjects = async (req, res, next) => {
    try {
        const projects = await workProjectRepository.getWorkProjects();
        return res.json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetWorkProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await workProjectRepository.getWorkProjectById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Work project not found.",
            });
        }
        return res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const handleCreateWorkProject = async (req, res, next) => {
    try {
        const videoFile = req.files?.video?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!videoFile) {
            return res.status(400).json({
                success: false,
                message: "A video file is required (max 80MB).",
            });
        }

        // Strict 80MB validation
        if (videoFile.size > MAX_VIDEO_BYTES) {
            return res.status(400).json({
                success: false,
                message: `Video file is too large (${(videoFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed limit is 80MB.`,
            });
        }

        // Upload Video to ImageKit
        const videoUpload = await uploadMedia(videoFile, "/portfolio/work-videos", [
            "work-project",
            "transit-video",
        ]);

        // Upload Thumbnail if provided
        let thumbnailUrl = "";
        if (thumbnailFile) {
            const thumbUpload = await uploadMedia(thumbnailFile, "/portfolio/work-thumbnails", [
                "work-project",
                "thumbnail",
            ]);
            thumbnailUrl = thumbUpload.url;
        } else if (videoUpload.thumbnailUrl) {
            thumbnailUrl = videoUpload.thumbnailUrl;
        }

        const title = req.body.title?.trim() || "Untitled Project";
        const station_name = req.body.station_name?.trim() || "";
        const floating_tag = req.body.floating_tag?.trim() || "FEATURED";
        const client = req.body.client?.trim() || "";
        const summary = req.body.summary?.trim() || "";
        const seo_title = req.body.seo_title?.trim() || title;
        const seo_description = req.body.seo_description?.trim() || summary;
        const video_mov_url = req.body.video_mov_url?.trim() || "";
        const keyword = req.body.keyword?.trim() || "Cinematography";
        const camera = req.body.camera?.trim() || "ARRI LF";
        const lens = req.body.lens?.trim() || "ANAMORPHIC";
        const format_ratio = req.body.format_ratio?.trim() || "2.39:1";
        const sort_order = parseInt(req.body.sort_order, 10) || 0;
        const is_featured = req.body.is_featured === "true" || req.body.is_featured === true;

        const newProject = await workProjectRepository.createWorkProject({
            title,
            station_name,
            floating_tag,
            client,
            summary,
            seo_title,
            seo_description,
            video_url: videoUpload.url,
            video_mov_url,
            thumbnail_url: thumbnailUrl,
            file_id: videoUpload.fileId,
            keyword,
            camera,
            lens,
            format_ratio,
            sort_order,
            is_featured,
        });

        return res.status(201).json({
            success: true,
            message: "Work project created successfully with 80MB video validation.",
            data: newProject,
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateWorkProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await workProjectRepository.getWorkProjectById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Work project not found.",
            });
        }

        const updateData = { ...req.body };

        // Handle new video file if provided
        const videoFile = req.files?.video?.[0];
        if (videoFile) {
            if (videoFile.size > MAX_VIDEO_BYTES) {
                return res.status(400).json({
                    success: false,
                    message: `Video file is too large (${(videoFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed limit is 80MB.`,
                });
            }
            const videoUpload = await uploadMedia(videoFile, "/portfolio/work-videos", [
                "work-project",
                "transit-video",
            ]);
            updateData.video_url = videoUpload.url;
            updateData.file_id = videoUpload.fileId;
        }

        // Handle new thumbnail if provided
        const thumbnailFile = req.files?.thumbnail?.[0];
        if (thumbnailFile) {
            const thumbUpload = await uploadMedia(thumbnailFile, "/portfolio/work-thumbnails", [
                "work-project",
                "thumbnail",
            ]);
            updateData.thumbnail_url = thumbUpload.url;
        }

        if (updateData.is_featured !== undefined) {
            updateData.is_featured =
                updateData.is_featured === "true" || updateData.is_featured === true;
        }

        const updated = await workProjectRepository.updateWorkProject(id, updateData);

        return res.json({
            success: true,
            message: "Work project updated successfully.",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteWorkProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await workProjectRepository.deleteWorkProject(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Work project not found or already deleted.",
            });
        }

        if (deleted.file_id) {
            try {
                await deleteMedia(deleted.file_id);
            } catch (mediaErr) {
                console.warn("[WorkProject] Could not delete video from ImageKit:", mediaErr?.message);
            }
        }

        return res.json({
            success: true,
            message: "Work project deleted successfully.",
            data: deleted,
        });
    } catch (error) {
        next(error);
    }
};

export const handleReorderWorkProjects = async (req, res, next) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({
                success: false,
                message: "orderedIds array is required.",
            });
        }
        const updatedList = await workProjectRepository.reorderWorkProjects(orderedIds);
        return res.json({
            success: true,
            message: "Work projects reordered successfully.",
            data: updatedList,
        });
    } catch (error) {
        next(error);
    }
};


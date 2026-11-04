import * as sketchbookRepository from "../repositories/sketchbook.repository.js";
import { uploadMedia, deleteMedia } from "../modules/image.service.js";

const MAX_SKETCHBOOK_IMAGES = 10;

export const handleGetSketchbookImages = async (req, res, next) => {
    try {
        const images = await sketchbookRepository.getImages();
        return res.json({
            success: true,
            count: images.length,
            maxAllowed: MAX_SKETCHBOOK_IMAGES,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

export const handleUploadSketchbookImage = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required for upload.",
            });
        }

        // Enforce maximum 10 images limit
        const currentCount = await sketchbookRepository.countImages();
        if (currentCount >= MAX_SKETCHBOOK_IMAGES) {
            return res.status(400).json({
                success: false,
                message: `Maximum limit of ${MAX_SKETCHBOOK_IMAGES} sketchbook images reached. Please delete an existing plate before adding a new one.`,
            });
        }

        // Convert to WebP and upload using ImageKit service module
        const uploadResult = await uploadMedia(file, "/portfolio/sketchbook", [
            "sketchbook",
            "curated-works",
            "infinite-pages",
        ]);

        const title = req.body.title?.trim() || file.originalname.replace(/\.[^/.]+$/, "") || "Untitled Plate";
        const place = req.body.place?.trim() || "";
        const description = req.body.description?.trim() || "";
        const sort_order = parseInt(req.body.sort_order, 10) || currentCount;

        const savedImage = await sketchbookRepository.createImage({
            title,
            place,
            description,
            image_url: uploadResult.url,
            thumbnail_url: uploadResult.thumbnailUrl || uploadResult.url,
            file_id: uploadResult.fileId,
            sort_order,
        });

        return res.status(201).json({
            success: true,
            message: "Image converted to WebP and added to Curated Works successfully.",
            data: savedImage,
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteSketchbookImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const image = await sketchbookRepository.getImageById(id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Sketchbook image not found.",
            });
        }

        // Delete from ImageKit if fileId exists
        if (image.file_id) {
            try {
                await deleteMedia(image.file_id);
            } catch (ikError) {
                console.warn(`[ImageKit] Could not delete file ${image.file_id}:`, ikError.message);
            }
        }

        // Delete from PostgreSQL
        await sketchbookRepository.deleteImage(id);

        return res.json({
            success: true,
            message: "Sketchbook image deleted successfully.",
            data: { id },
        });
    } catch (error) {
        next(error);
    }
};

export const handleReorderSketchbookImages = async (req, res, next) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "orderedIds array is required.",
            });
        }

        const reordered = await sketchbookRepository.reorderImages(orderedIds);
        return res.json({
            success: true,
            message: "Plates order updated successfully.",
            data: reordered,
        });
    } catch (error) {
        next(error);
    }
};


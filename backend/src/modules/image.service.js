import ImageKit from "imagekit";
import sharp from "sharp";

let _imagekit = null;
function getImageKit() {
    if (_imagekit) return _imagekit;
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } =
        process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
        throw new MediaUploadError(
            "[ImageKit] Missing env: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT",
            { status: 500 }
        );
    }

    _imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
    return _imagekit;
}

const DEFAULT_FOLDER = "/portfolio";
const MB = 1024 * 1024;

const MAX_IMAGE_SIZE = 20 * MB; // input; output WebP chhota ho jata hai
const MAX_VIDEO_SIZE = 100 * MB;

const WEBP_QUALITY = 80;
const IMAGE_MAX_WIDTH = 2000;

export class MediaUploadError extends Error {
    constructor(message, { status = 400, cause } = {}) {
        super(message, { cause });
        this.name = "MediaUploadError";
        this.status = status;
    }
}

const normalizeFolder = (folder) => {
    const clean = String(folder || DEFAULT_FOLDER)
        .replace(/\.\./g, "")
        .replace(/\/+/g, "/")
        .replace(/\/$/, "");
    return clean.startsWith("/") ? clean : `/${clean}`;
};

const sanitizeFileName = (name = "file") =>
    name.replace(/[^\w.\-]+/g, "_").slice(0, 100);

const withExtension = (name, ext) =>
    `${sanitizeFileName(name).replace(/\.[^.]+$/, "")}.${ext}`;

/** Returns "image" | "video" */
const getMediaType = (file) => {
    if (!file || !file.buffer) {
        throw new MediaUploadError("File is required");
    }

    const type = file.mimetype?.split("/")[0];
    if (type !== "image" && type !== "video") {
        throw new MediaUploadError(`Unsupported file type: ${file.mimetype}`, {
            status: 415,
        });
    }

    const max = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > max) {
        throw new MediaUploadError(
            `${type} too large. Max ${max / MB}MB allowed`,
            {
                status: 413,
            },
        );
    }

    return type;
};

/** Image -> WebP: auto-rotate (EXIF), resize, metadata strip, animated GIF support. */
const toWebp = async (buffer) => {
    try {
        return await sharp(buffer, { animated: true })
            .rotate()
            .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, effort: 5 })
            .toBuffer();
    } catch (error) {
        throw new MediaUploadError("Invalid or corrupted image", {
            status: 422,
            cause: error,
        });
    }
};

/**
 * Upload image (saved as WebP) or video (saved as-is, max 100MB).
 * @param {Express.Multer.File} file
 * @param {string} [folder="/portfolio"]
 * @param {string[]} [tags=[]]
 */
export async function uploadMedia(file, folder = DEFAULT_FOLDER, tags = []) {
    const type = getMediaType(file);
    const ik = getImageKit();

    const payload =
        type === "image"
            ? {
                  file: await toWebp(file.buffer),
                  fileName: withExtension(file.originalname, "webp"),
              }
            : {
                  file: file.buffer,
                  fileName: sanitizeFileName(file.originalname),
              };

    try {
        const result = await ik.upload({
            ...payload,
            folder: normalizeFolder(folder),
            useUniqueFileName: true,
            tags,
        });

        return {
            type,
            url: result.url,
            fileId: result.fileId,
            filePath: result.filePath,
            name: result.name,
            thumbnailUrl: result.thumbnailUrl,
        };
    } catch (error) {
        throw new MediaUploadError("Media upload failed", {
            status: 502,
            cause: error,
        });
    }
}

export async function deleteMedia(fileId) {
    if (!fileId) {
        throw new MediaUploadError("fileId is required");
    }

    const ik = getImageKit();
    try {
        await ik.deleteFile(fileId);
    } catch (error) {
        throw new MediaUploadError("Media delete failed", {
            status: 502,
            cause: error,
        });
    }
}

// Backward compatible aliases
export const uploadImage = uploadMedia;
export const deleteImage = deleteMedia;
export const ImageUploadError = MediaUploadError;

const imageService = {
    uploadMedia,
    uploadImage,
    deleteMedia,
    deleteImage,
    MediaUploadError,
    ImageUploadError: MediaUploadError,
};

export default imageService;

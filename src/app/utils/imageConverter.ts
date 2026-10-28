/**
 * Image Converter & Optimization Utilities
 * Client-side and universal image transformation, format conversion,
 * compression, resizing, and filtering.
 */

export type SupportedImageFormat = "image/webp" | "image/jpeg" | "image/png" | "image/avif";

export interface ImageConversionOptions {
    format?: SupportedImageFormat;
    quality?: number; // 0.1 to 1.0 (default 0.85)
    maxWidth?: number;
    maxHeight?: number;
    maintainAspectRatio?: boolean;
}

export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
}

export interface ImageFilterOptions {
    brightness?: number; // 100 is default (%)
    contrast?: number;   // 100 is default (%)
    saturation?: number; // 100 is default (%)
    sepia?: number;      // 0 to 100 (%)
    grayscale?: boolean;
    warmTint?: boolean;  // Adds parchment/warm sepia aesthetic
}

/**
 * Reads a File or Blob into an HTMLImageElement
 */
export function loadImageFromFile(fileOrBlob: Blob | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(fileOrBlob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.src = url;
    });
}

/**
 * Loads an image from a URL or Data URI
 */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Calculates new dimensions fitting within maxWidth and maxHeight while preserving aspect ratio
 */
export function calculateFitDimensions(
    srcWidth: number,
    srcHeight: number,
    maxWidth?: number,
    maxHeight?: number,
): { width: number; height: number } {
    if (!maxWidth && !maxHeight) {
        return { width: srcWidth, height: srcHeight };
    }

    let targetWidth = srcWidth;
    let targetHeight = srcHeight;
    const ratio = srcWidth / srcHeight;

    if (maxWidth && targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(targetWidth / ratio);
    }

    if (maxHeight && targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(targetHeight * ratio);
    }

    return { width: targetWidth, height: targetHeight };
}

/**
 * Extracts width, height, and aspect ratio from a File, Blob, or URL
 */
export async function getImageDimensions(source: File | Blob | string): Promise<ImageDimensions> {
    const img = typeof source === "string" ? await loadImageFromUrl(source) : await loadImageFromFile(source);
    return {
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspectRatio: (img.naturalWidth || img.width) / (img.naturalHeight || img.height || 1),
    };
}

/**
 * Converts any File or Blob to a target image format (WebP, JPEG, PNG, AVIF) with optional resizing and quality tuning
 */
export async function convertImage(
    fileOrBlob: File | Blob,
    options: ImageConversionOptions = {},
): Promise<Blob> {
    const {
        format = "image/webp",
        quality = 0.85,
        maxWidth,
        maxHeight,
        maintainAspectRatio = true,
    } = options;

    const img = await loadImageFromFile(fileOrBlob);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Unable to obtain 2D canvas context for image conversion.");
    }

    const { width, height } = maintainAspectRatio
        ? calculateFitDimensions(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight)
        : { width: maxWidth || img.naturalWidth, height: maxHeight || img.naturalHeight };

    canvas.width = width;
    canvas.height = height;

    // Enable high quality bicubic image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, width, height);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(`Conversion to format ${format} failed.`));
                }
            },
            format,
            quality,
        );
    });
}

/**
 * Converts an image file directly to a WebP format File object
 */
export async function convertToWebP(
    file: File,
    quality = 0.85,
    maxWidth?: number,
    maxHeight?: number,
): Promise<File> {
    const blob = await convertImage(file, {
        format: "image/webp",
        quality,
        maxWidth,
        maxHeight,
    });
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

/**
 * Converts a File or Blob to a Base64 Data URL string
 */
export function fileToDataUrl(fileOrBlob: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBlob);
    });
}

/**
 * Converts a Base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mime });
}

/**
 * Iteratively compresses an image until it falls under a target size in bytes
 */
export async function compressImageToTargetSize(
    file: File | Blob,
    maxSizeBytes: number,
    format: SupportedImageFormat = "image/webp",
): Promise<Blob> {
    let currentQuality = 0.9;
    let currentBlob = await convertImage(file, { format, quality: currentQuality });

    while (currentBlob.size > maxSizeBytes && currentQuality > 0.2) {
        currentQuality -= 0.15;
        currentBlob = await convertImage(file, { format, quality: currentQuality });
    }

    return currentBlob;
}

/**
 * Applies custom stylistic artistic filters to an image (e.g. warm parchment tint, contrast adjustments)
 */
export async function applyImageFilter(
    source: File | Blob | HTMLImageElement,
    filter: ImageFilterOptions,
    format: SupportedImageFormat = "image/webp",
    quality = 0.88,
): Promise<Blob> {
    const img = source instanceof HTMLImageElement ? source : await loadImageFromFile(source);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not initialize 2D context for image filtering.");

    const filterStrings: string[] = [];
    if (filter.brightness !== undefined) filterStrings.push(`brightness(${filter.brightness}%)`);
    if (filter.contrast !== undefined) filterStrings.push(`contrast(${filter.contrast}%)`);
    if (filter.saturation !== undefined) filterStrings.push(`saturate(${filter.saturation}%)`);
    if (filter.sepia !== undefined) filterStrings.push(`sepia(${filter.sepia}%)`);
    if (filter.grayscale) filterStrings.push("grayscale(100%)");

    ctx.filter = filterStrings.length > 0 ? filterStrings.join(" ") : "none";
    ctx.drawImage(img, 0, 0);

    // Warm parchment tint overlay if enabled
    if (filter.warmTint) {
        ctx.filter = "none";
        ctx.fillStyle = "rgba(230, 221, 210, 0.18)";
        ctx.globalCompositeOperation = "multiply";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
    }

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export filtered image."))),
            format,
            quality,
        );
    });
}

/**
 * Batch converts a list of image files with sequential execution and progress reporting
 */
export async function batchConvertImages(
    files: File[],
    options: ImageConversionOptions = {},
    onProgress?: (progress: { current: number; total: number; filename: string }) => void,
): Promise<Blob[]> {
    const results: Blob[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.({ current: i + 1, total: files.length, filename: file.name });
        const converted = await convertImage(file, options);
        results.push(converted);
    }

    return results;
}

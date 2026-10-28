/**
 * Video Converter & Media Processing Utilities
 * Provides browser and Node-compatible utilities for WebM (VP9) transcoding,
 * video frame extraction, metadata inspection, and canvas stream recording.
 */

export interface VideoMetadata {
    duration: number; // in seconds
    width: number;
    height: number;
    aspectRatio: number;
}

export interface FrameCaptureOptions {
    timestampSeconds?: number;
    format?: "image/webp" | "image/jpeg" | "image/png";
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
}

export interface VP9EncodingConfig {
    crf?: number;         // 28 (high quality) to 36 (small size), default 32
    speed?: number;       // 1 (slow/efficient) to 4 (faster), default 2
    quality?: "good" | "best" | "realtime";
    audioBitrate?: string;// default "128k"
    rowMt?: boolean;      // multi-threading for tiles (default true)
    threads?: number;     // 0 for auto
}

export const DEFAULT_VP9_CONFIG: VP9EncodingConfig = {
    crf: 32,
    speed: 2,
    quality: "good",
    audioBitrate: "128k",
    rowMt: true,
    threads: 0,
};

/**
 * Checks if the current browser environment can natively play WebM VP9 video
 */
export function isWebmVP9Supported(): boolean {
    if (typeof document === "undefined") return false;
    const video = document.createElement("video");
    const canPlay = video.canPlayType('video/webm; codecs="vp9, opus"');
    return canPlay === "probably" || canPlay === "maybe";
}

/**
 * Loads an HTMLVideoElement from a File, Blob, or URL string
 */
export function loadVideoElement(source: File | Blob | string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const isObjectUrl = source instanceof Blob;
        const url = isObjectUrl ? URL.createObjectURL(source) : source;

        video.onloadedmetadata = () => {
            resolve(video);
        };

        video.onerror = (e) => {
            if (isObjectUrl) URL.revokeObjectURL(url);
            reject(new Error(`Failed to load video element: ${video.error?.message || "Unknown error"}`));
        };

        video.src = url;
    });
}

/**
 * Extracts duration, resolution, and aspect ratio from a video source
 */
export async function getVideoMetadata(source: File | Blob | string): Promise<VideoMetadata> {
    const video = await loadVideoElement(source);
    const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / (video.videoHeight || 1),
    };

    if (source instanceof Blob) {
        URL.revokeObjectURL(video.src);
    }

    return metadata;
}

/**
 * Captures a single still frame at a given timestamp from a video and exports it as an image Blob
 */
export async function captureVideoFrame(
    source: File | Blob | string,
    options: FrameCaptureOptions = {},
): Promise<Blob> {
    const {
        timestampSeconds = 0.5,
        format = "image/webp",
        quality = 0.9,
        maxWidth,
        maxHeight,
    } = options;

    const video = await loadVideoElement(source);

    return new Promise((resolve, reject) => {
        const seekTime = Math.min(Math.max(0, timestampSeconds), Math.max(0, video.duration - 0.1));

        video.onseeked = () => {
            try {
                let targetWidth = video.videoWidth;
                let targetHeight = video.videoHeight;

                if (maxWidth && targetWidth > maxWidth) {
                    targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
                    targetWidth = maxWidth;
                }
                if (maxHeight && targetHeight > maxHeight) {
                    targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
                    targetHeight = maxHeight;
                }

                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    throw new Error("Unable to create canvas 2D context for video capture.");
                }

                ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

                canvas.toBlob(
                    (blob) => {
                        if (source instanceof Blob) URL.revokeObjectURL(video.src);
                        if (blob) resolve(blob);
                        else reject(new Error("Failed to encode frame to blob."));
                    },
                    format,
                    quality,
                );
            } catch (err) {
                if (source instanceof Blob) URL.revokeObjectURL(video.src);
                reject(err);
            }
        };

        video.currentTime = seekTime;
    });
}

/**
 * Generates an array of evenly spaced thumbnail preview blobs across a video
 */
export async function generateVideoThumbnails(
    source: File | Blob | string,
    count = 5,
    format: "image/webp" | "image/jpeg" = "image/webp",
): Promise<Blob[]> {
    const video = await loadVideoElement(source);
    const duration = video.duration || 1;
    const interval = duration / (count + 1);
    const thumbnails: Blob[] = [];

    for (let i = 1; i <= count; i++) {
        const frame = await captureVideoFrame(video.src, {
            timestampSeconds: interval * i,
            format,
            quality: 0.8,
            maxWidth: 640,
        });
        thumbnails.push(frame);
    }

    if (source instanceof Blob) URL.revokeObjectURL(video.src);
    return thumbnails;
}

/**
 * Records an active MediaStream (e.g. from Canvas or Camera) into a WebM (VP9 preferred) Blob
 */
export function recordStreamToWebm(
    stream: MediaStream,
    durationMs: number,
    bitsPerSecond = 2500000,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const preferredMime = MediaRecorder.isTypeSupported('video/webm; codecs="vp9, opus"')
            ? 'video/webm; codecs="vp9, opus"'
            : MediaRecorder.isTypeSupported('video/webm; codecs="vp9"')
              ? 'video/webm; codecs="vp9"'
              : 'video/webm';

        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(stream, {
            mimeType: preferredMime,
            videoBitsPerSecond: bitsPerSecond,
        });

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: preferredMime });
            resolve(finalBlob);
        };

        recorder.onerror = reject;

        recorder.start(250);
        setTimeout(() => {
            if (recorder.state === "recording") {
                recorder.stop();
            }
        }, durationMs);
    });
}

/**
 * Builds the array of FFmpeg arguments for WebM (VP9 + Opus) transcoding
 */
export function buildFFmpegVP9Args(
    inputPath: string,
    outputPath: string,
    config: VP9EncodingConfig = {},
): string[] {
    const cfg = { ...DEFAULT_VP9_CONFIG, ...config };

    return [
        "-y",
        "-i", inputPath,
        "-c:v", "libvpx-vp9",
        "-crf", String(cfg.crf),
        "-b:v", "0",
        "-speed", String(cfg.speed),
        "-quality", cfg.quality || "good",
        ...(cfg.rowMt ? ["-row-mt", "1"] : []),
        "-threads", String(cfg.threads ?? 0),
        "-c:a", "libopus",
        "-b:a", cfg.audioBitrate || "128k",
        outputPath,
    ];
}

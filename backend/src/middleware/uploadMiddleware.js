import multer from "multer";

const storage = multer.memoryStorage();

// 100MB limit to match video max size in image.service
export const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});

export const uploadImage = upload.single("image");
export const uploadFile = upload.single("file");

export default upload;


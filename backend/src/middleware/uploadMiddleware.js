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

// Dedicated, strictly hardened upload middleware for Bulk Blog Ingestion (JSON/CSV)
export const uploadBulkImport = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB maximum
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /\.(json|csv)$/i;
        const allowedMimes = [
            "application/json",
            "text/csv",
            "text/plain",
            "application/vnd.ms-excel",
            "text/x-csv",
            "application/csv",
            "application/octet-stream",
        ];

        if (!allowedExtensions.test(file.originalname || "")) {
            const err = new Error("Invalid file extension. Only .json and .csv files are permitted.");
            err.status = 415;
            return cb(err);
        }

        if (file.mimetype && !allowedMimes.includes(file.mimetype.toLowerCase())) {
            const err = new Error(`Unsupported MIME type "${file.mimetype}". Only JSON and CSV are allowed.`);
            err.status = 415;
            return cb(err);
        }

        cb(null, true);
    },
}).single("file");

export default upload;


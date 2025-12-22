"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Use memory storage to handle the file in buffer
const storage = multer_1.default.memoryStorage();
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mime = file.mimetype;
    if (allowedTypes.test(mime)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});
// POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: 'hospital_blog_images', // Optional: organize in a folder
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
            }
            if (!result) {
                return res.status(500).json({ message: 'Cloudinary upload failed: No result' });
            }
            // Return the secure URL
            res.json({
                message: 'File uploaded successfully',
                imageUrl: result.secure_url
            });
        });
        // Write buffer to stream
        uploadStream.end(req.file.buffer);
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Server error during upload' });
    }
});
exports.default = router;

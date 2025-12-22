import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Use memory storage to handle the file in buffer
const storage = multer.memoryStorage()

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/
    const mime = file.mimetype

    if (allowedTypes.test(mime)) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'))
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
})

// POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'hospital_blog_images', // Optional: organize in a folder
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error)
                    return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message })
                }

                if (!result) {
                    return res.status(500).json({ message: 'Cloudinary upload failed: No result' })
                }

                // Return the secure URL
                res.json({
                    message: 'File uploaded successfully',
                    imageUrl: result.secure_url
                })
            }
        )

        // Write buffer to stream
        uploadStream.end(req.file.buffer)

    } catch (err) {
        console.error('Upload error:', err)
        res.status(500).json({ message: 'Server error during upload' })
    }
})

export default router

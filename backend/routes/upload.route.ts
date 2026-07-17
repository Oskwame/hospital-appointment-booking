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

// File filter for images
const imageFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/
    const mime = file.mimetype

    if (allowedTypes.test(mime)) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'))
    }
}

// File filter for documents
const documentFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /pdf|doc|docx|txt|rtf/
    const mime = file.mimetype
    const ext = file.originalname.split('.').pop()?.toLowerCase()

    if (allowedTypes.test(mime) || allowedTypes.test(ext || '')) {
        cb(null, true)
    } else {
        cb(new Error('Only documents are allowed (pdf, doc, docx, txt, rtf)'))
    }
}

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter
})

const uploadDocument = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
    fileFilter: documentFilter
})

// POST /api/upload - Image upload
router.post('/', uploadImage.single('image'), async (req, res) => {
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

// POST /api/upload/document - Document upload (CV, cover letter, certificates)
router.post('/document', uploadDocument.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'career_applications',
                resource_type: 'raw', // Important for non-image files
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error)
                    return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message })
                }

                if (!result) {
                    return res.status(500).json({ message: 'Cloudinary upload failed: No result' })
                }

                res.json({
                    message: 'Document uploaded successfully',
                    fileUrl: result.secure_url,
                    fileName: req.file!.originalname
                })
            }
        )

        uploadStream.end(req.file.buffer)

    } catch (err) {
        console.error('Document upload error:', err)
        res.status(500).json({ message: 'Server error during upload' })
    }
})

export default router

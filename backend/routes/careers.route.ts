import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '../prisma/prismaClient'
import { sanitizeText } from '../utils/sanitization'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|jpg|jpeg|png/
    const ext = file.originalname.split('.').pop()?.toLowerCase() || ''
    if (allowed.test(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only pdf, doc, docx, jpg, jpeg, png files are allowed'))
    }
  }
})

const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'))
        resolve(result.secure_url)
      }
    )
    stream.end(file.buffer)
  })
}

const router = express.Router()

// GET /api/careers
router.get('/', async (_req, res) => {
  try {
    const careers = await prisma.career.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(careers)
  } catch (err) {
    console.error('Fetch careers error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/careers/with-applications
router.get('/with-applications', async (_req, res) => {
  try {
    const careers = await prisma.career.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        applications: { orderBy: { createdAt: 'desc' } }
      }
    })
    res.json(careers)
  } catch (err) {
    console.error('Fetch careers with applications error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/careers/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    const career = await prisma.career.findUnique({ where: { id } })
    if (!career) return res.status(404).json({ message: 'Career not found' })
    res.json(career)
  } catch (err) {
    console.error('Fetch career error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/careers/:id/applications
router.get('/:id/applications', async (req, res) => {
  try {
    const careerId = Number(req.params.id)
    if (!Number.isInteger(careerId)) return res.status(400).json({ message: 'Invalid id' })

    const career = await prisma.career.findUnique({ where: { id: careerId } })
    if (!career) return res.status(404).json({ message: 'Career not found' })

    const applications = await prisma.application.findMany({
      where: { careerId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ career, applications })
  } catch (err) {
    console.error('Fetch applications error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/careers/applications/:id/status
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })

    const { status } = req.body
    const allowed = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected']
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` })
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    })
    res.json(application)
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Application not found' })
    console.error('Update application status error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/careers/:id/applications - Submit application with file uploads
router.post('/:id/applications', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), async (req, res) => {
  try {
    const careerId = Number(req.params.id)
    if (!Number.isInteger(careerId)) return res.status(400).json({ message: 'Invalid id' })

    const career = await prisma.career.findUnique({ where: { id: careerId } })
    if (!career) return res.status(404).json({ message: 'Career not found' })

    const { firstName, lastName, email, phone, address, education, experience, licenses } = req.body

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: 'First name, last name, email, and phone are required' })
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined

    let cvUrl: string | undefined
    let coverLetterUrl: string | undefined
    let certificatesUrl: string | undefined

    if (files?.cv?.[0]) {
      cvUrl = await uploadToCloudinary(files.cv[0], 'career_applications/cv')
    }
    if (files?.coverLetter?.[0]) {
      coverLetterUrl = await uploadToCloudinary(files.coverLetter[0], 'career_applications/cover_letters')
    }
    if (files?.certificates?.[0]) {
      certificatesUrl = await uploadToCloudinary(files.certificates[0], 'career_applications/certificates')
    }

    const application = await prisma.application.create({
      data: {
        careerId,
        firstName: sanitizeText(firstName),
        lastName: sanitizeText(lastName),
        email: sanitizeText(email),
        phone: sanitizeText(phone),
        address: address ? sanitizeText(address) : undefined,
        education: education ? sanitizeText(education) : undefined,
        experience: experience ? sanitizeText(experience) : undefined,
        licenses: licenses ? sanitizeText(licenses) : undefined,
        cvFileName: cvUrl,
        coverLetterFileName: coverLetterUrl,
        certificatesFileName: certificatesUrl,
      }
    })

    res.status(201).json(application)
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Career not found' })
    console.error('Create application error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/careers
router.post('/', async (req, res) => {
  try {
    const { title, department, location, type, description, requirements, salary, status } = req.body

    if (!title || !department || !location || !description || !requirements) {
      return res.status(400).json({ message: 'Title, department, location, description, and requirements are required' })
    }

    const career = await prisma.career.create({
      data: {
        title: sanitizeText(title),
        department: sanitizeText(department),
        location: sanitizeText(location),
        type: type || 'Full-time',
        description: sanitizeText(description),
        requirements: sanitizeText(requirements),
        salary: salary ? sanitizeText(salary) : undefined,
        status: status || 'active',
      }
    })
    res.status(201).json(career)
  } catch (err) {
    console.error('Create career error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/careers/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })

    const { title, department, location, type, description, requirements, salary, status } = req.body

    const career = await prisma.career.update({
      where: { id },
      data: {
        title: sanitizeText(title),
        department: sanitizeText(department),
        location: sanitizeText(location),
        type,
        description: sanitizeText(description),
        requirements: sanitizeText(requirements),
        salary: salary ? sanitizeText(salary) : undefined,
        status,
      }
    })
    res.json(career)
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Update career error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/careers/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    await prisma.career.delete({ where: { id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Delete career error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

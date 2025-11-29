//routes/auth.route.ts
import express from 'express'
import prisma from '../prisma/prismaClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import auth from '../middleware/auth'
import nodemailer from 'nodemailer'

const otpStore = new Map<string, { code: string; expires: number }>()
const OTP_TTL_MS = 10 * 60 * 1000

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !port || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

// POST /api/auth/login
const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate token with role
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    })

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.json({ token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ message: 'Logged out' })
})

// POST /api/auth/users/request-otp (SUPERADMIN only)
router.post('/users/request-otp', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { email } = req.body as { email?: string }
    if (!email) return res.status(400).json({ message: 'Email is required' })
    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpStore.set(email, { code, expires: Date.now() + OTP_TTL_MS })

    const transporter = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    const body = `Your verification code is ${code}. It expires in 3 minutes.`
    if (transporter) {
      await transporter.sendMail({ from, to: email, subject: 'Your OTP Code', text: body })
    } else {
      console.log('[DEV] OTP for', email, 'is', code)
    }
    return res.json({ message: 'OTP sent' })
  } catch (err) {
    console.error('Request OTP error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/users  (SUPERADMIN only)
router.post('/users', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { email, password, role: newRole, otp } = req.body as { email?: string; password?: string; role?: string; otp?: string }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const targetRole = String(newRole || 'ADMIN').toUpperCase()
    if (!['ADMIN', 'DOCTOR'].includes(targetRole)) {
      return res.status(400).json({ message: 'Role must be ADMIN or DOCTOR' })
    }

    const rec = otpStore.get(email)
    if (!rec || !otp || rec.code !== String(otp) || rec.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return res.status(409).json({ message: 'User already exists' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({ data: { email, password: hashed, role: targetRole as any } })

    if (targetRole === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          name: 'Pending Name',
          specialization: 'General',
          email: created.email,
          phone: 'Pending Phone',
          service: 'General',
          status: 'available',
        },
      })
    }

    otpStore.delete(email)
    return res.status(201).json({ id: created.id, email: created.email, role: created.role })
  } catch (err) {
    console.error('Create user error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/users  (SUPERADMIN only)
router.get('/users', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json(users)
  } catch (err) {
    console.error('Fetch users error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { id: true, email: true, role: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/profile', auth, async (req, res) => {
  try {
    if (String((req as any).userRole).toUpperCase() !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
    const { email } = req.body
    const updated = await prisma.user.update({ where: { id: (req as any).userId }, data: { email } })
    res.json({ id: updated.id, email: updated.email })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }
    const user = await prisma.user.findUnique({ where: { id: (req as any).userId } })
    if (!user) return res.status(404).json({ message: 'Not found' })
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid current password' })
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/auth/users/:id  (SUPERADMIN only)
router.patch('/users/:id', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const userId = parseInt(req.params.id)
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const { email, password, role: newRole } = req.body as { email?: string; password?: string; role?: string }

    // Validate role if provided
    if (newRole) {
      const targetRole = String(newRole).toUpperCase()
      if (!['ADMIN', 'DOCTOR'].includes(targetRole)) {
        return res.status(400).json({ message: 'Role must be ADMIN or DOCTOR' })
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Build update data
    const updateData: any = {}
    if (email) {
      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: userId } }
      })
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use' })
      }
      updateData.email = email
    }
    if (newRole) {
      updateData.role = String(newRole).toUpperCase() as any
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' })
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update the user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // If email changed and user is a doctor, update doctor record
    if (email && user.role === 'DOCTOR') {
      await prisma.doctor.updateMany({
        where: { email: user.email },
        data: { email }
      })
    }

    return res.json(updated)
  } catch (err) {
    console.error('Update user error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/auth/users/:id  (SUPERADMIN only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const userId = parseInt(req.params.id)
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    // Prevent deleting yourself
    if (userId === (req as any).userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await prisma.user.delete({ where: { id: userId } })
    return res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('Delete user error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

export default router;

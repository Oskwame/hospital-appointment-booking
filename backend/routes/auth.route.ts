//routes/auth.route.ts
import express from 'express'
import prisma from '../prisma/prismaClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import auth from '../middleware/auth'
import nodemailer from 'nodemailer'

const otpStore = new Map<string, { code: string; expires: number }>()
const OTP_TTL_MS = 10 * 60 * 1000

// simple in-memory preferences per user
const userPrefs = new Map<number, { autoApproval: boolean; emailNotifications: boolean }>()
// simple in-memory hospital settings
let hospitalSettings: {
  hospitalName: string
  email: string
  phone: string
  address: string
  timezone: string
  dataRetention: string
} = {
  hospitalName: 'Kasa Family Hospital',
  email: 'info@kasa.com',
  phone: '+1 234-567-8900',
  address: '123 Healthcare Avenue, Medical City',
  timezone: 'UTC-5',
  dataRetention: '2 years',
}

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

// GET current user's preferences
router.get('/preferences', auth, async (req, res) => {
  const id = (req as any).userId as number
  const prefs = userPrefs.get(id) || { autoApproval: false, emailNotifications: true }
  res.json(prefs)
})

// Update current user's preferences
router.put('/preferences', auth, async (req, res) => {
  const id = (req as any).userId as number
  const { autoApproval, emailNotifications } = req.body as any
  const current = userPrefs.get(id) || { autoApproval: false, emailNotifications: true }
  const updated = {
    autoApproval: typeof autoApproval === 'boolean' ? autoApproval : current.autoApproval,
    emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : current.emailNotifications,
  }
  userPrefs.set(id, updated)
  res.json(updated)
})

// Hospital settings (SUPERADMIN only)
router.get('/hospital', auth, async (req, res) => {
  const role = String((req as any).userRole || '').toUpperCase()
  if (role !== 'SUPERADMIN') return res.status(403).json({ message: 'Forbidden' })
  res.json(hospitalSettings)
})

router.put('/hospital', auth, async (req, res) => {
  const role = String((req as any).userRole || '').toUpperCase()
  if (role !== 'SUPERADMIN') return res.status(403).json({ message: 'Forbidden' })
  const payload = req.body as Partial<typeof hospitalSettings>
  hospitalSettings = { ...hospitalSettings, ...payload }
  res.json(hospitalSettings)
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
      where: {
        deletedAt: null, // Only active users
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
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

// GET /api/auth/users/deactivated  (SUPERADMIN only)
router.get('/users/deactivated', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const users = await prisma.user.findMany({
      where: {
        deletedAt: { not: null }, // Only deactivated users
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
    })

    return res.json(users)
  } catch (err) {
    console.error('Fetch deactivated users error:', err)
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

// Request OTP for email change
router.post('/request-email-change-otp', auth, async (req, res) => {
  try {
    const { newEmail } = req.body
    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ message: 'New email is required' })
    }

    // Check if email is already in use
    const existing = await prisma.user.findUnique({ where: { email: newEmail } })
    if (existing) {
      return res.status(409).json({ message: 'Email is already in use' })
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpStore.set(newEmail, { code, expires: Date.now() + OTP_TTL_MS })

    const transporter = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    const body = `Your verification code for email change is ${code}. It expires in 10 minutes.`

    if (transporter) {
      await transporter.sendMail({ from, to: newEmail, subject: 'Email Change Verification', text: body })
    } else {
      console.log('[DEV] Email Change OTP for', newEmail, 'is', code)
    }

    res.json({ message: 'OTP sent' })
  } catch (err) {
    console.error('Request OTP error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/profile', auth, async (req, res) => {
  try {
    const { email, otp } = req.body
    const userId = (req as any).userId as number

    if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Invalid email' })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // If email is changing, verify OTP
    if (email !== user.email) {
      if (!otp) {
        return res.status(400).json({ message: 'OTP is required to change email' })
      }

      const rec = otpStore.get(email)
      if (!rec || rec.code !== String(otp) || rec.expires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' })
      }

      // Check if email is taken (double check)
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return res.status(409).json({ message: 'Email is already in use' })
      }

      otpStore.delete(email)
    }

    const updated = await prisma.user.update({ where: { id: userId }, data: { email } })

    // If user is a doctor, update doctor record too
    if (user.role === 'DOCTOR') {
      await prisma.doctor.updateMany({
        where: { email: user.email }, // use old email to find
        data: { email: updated.email }
      })
    }

    res.json({ id: updated.id, email: updated.email })
  } catch (err) {
    console.error('Update profile error:', err)
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

// DELETE /api/auth/users/:id  (SUPERADMIN only) - Soft Delete
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

    // Prevent deactivating yourself
    if (userId === (req as any).userId) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Soft delete by setting deletedAt
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    })
    return res.json({ message: 'User deactivated successfully' })
  } catch (err) {
    console.error('Deactivate user error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/auth/users/:id/restore  (SUPERADMIN only) - Reactivate user
router.patch('/users/:id/restore', auth, async (req, res) => {
  try {
    const role = String((req as any).userRole || '').toUpperCase()
    if (role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const userId = parseInt(req.params.id)
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Reactivate by clearing deletedAt
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null }
    })
    return res.json({ message: 'User activated successfully' })
  } catch (err) {
    console.error('Activate user error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

export default router;

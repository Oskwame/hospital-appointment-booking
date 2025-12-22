//routes/auth.route.ts
import express from 'express'
import prisma from '../prisma/prismaClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import auth from '../middleware/auth'
import nodemailer from 'nodemailer'
import rateLimit from 'express-rate-limit'
import { sendOTP } from '../services/email.service'
import { isValidEmail } from '../utils/validators'
import { logLoginAttempt, logUserCreation, logUserUpdate, logUserDeactivation, logPasswordChange } from '../services/audit.service'

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

// Login-specific rate limiter - stricter limits for brute-force protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Use email-based tracking only to avoid IPv6 validation issues
  keyGenerator: (req) => {
    const email = req.body?.email
    return email ? `login_${email}` : 'unknown_user'
  },
  skip: (req) => !req.body?.email, // Skip rate limiting if no email provided
  handler: (req, res) => {
    const email = req.body?.email || 'unknown'
    console.warn(`[SECURITY] Rate limit exceeded for login attempts - Email: ${email}`)
    res.status(429).json({ message: 'Too many login attempts. Please try again in 15 minutes.' })
  }
})

// POST /api/auth/login
const router = express.Router()

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.warn(`[SECURITY] Failed login - Invalid email: ${email}, IP: ${req.ip}`)
      // Log failed login attempt
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip
      logLoginAttempt(email, false, ipAddress, req.headers['user-agent'])
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.warn(`[SECURITY] Failed login - Invalid password for: ${email}, IP: ${req.ip}`)
      // Log failed login attempt
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip
      logLoginAttempt(email, false, ipAddress, req.headers['user-agent'])
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Successful login - log it
    console.log(`[AUTH] Successful login: ${email}, IP: ${req.ip}`)

    // Audit log successful login
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip
    logLoginAttempt(email, true, ipAddress, req.headers['user-agent'], user.id)

    // Generate token with role
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    })

    // Cookie setting removed for header-based auth


    res.json({ token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', (_req, res) => {
  // No need to clear cookie in stateless auth

  res.json({ message: 'Logged out' })
})

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    // Get token from cookie or header
    const header = req.headers.authorization || ''
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null
    const cookieToken = (req as any).cookies?.token || null
    const token = bearer || cookieToken

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    // Verify the existing token (allow expired tokens to be refreshed within grace period)
    let payload: { userId: number; role: string }
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string }
    } catch (err: any) {
      // If token is expired, try to decode it anyway for refresh
      if (err.name === 'TokenExpiredError') {
        payload = jwt.decode(token) as { userId: number; role: string }
        if (!payload) {
          return res.status(401).json({ message: 'Invalid token' })
        }
      } else {
        return res.status(401).json({ message: 'Invalid token' })
      }
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.deletedAt) {
      return res.status(401).json({ message: 'User not found or deactivated' })
    }

    // Generate new token
    const newToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    })

    // Set new cookie
    // Cookie setting removed for header-based auth


    console.log(`[AUTH] Token refreshed for user: ${user.email}`)
    res.json({ token: newToken, message: 'Token refreshed' })
  } catch (err) {
    console.error('Token refresh error:', err)
    res.status(500).json({ message: 'Server error' })
  }
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

    try {
      await sendOTP(email, code, 10)
    } catch (emailError) {
      console.log('[DEV] OTP for', email, 'is', code)
      console.error('Failed to send OTP email:', emailError)
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

    try {
      await sendOTP(newEmail, code, 10)
    } catch (emailError) {
      console.log('[DEV] Email Change OTP for', newEmail, 'is', code)
      console.error('Failed to send email change OTP:', emailError)
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

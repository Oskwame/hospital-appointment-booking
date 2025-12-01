import express from 'express'
import prisma from '../prisma/prismaClient'
import auth from '../middleware/auth'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: 'desc' } })
    const payload = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialization: d.specialization,
      email: d.email,
      phone: d.phone,
      service: d.service,
      status: d.status,
      created_at: d.createdAt,
    }))
    res.json(payload)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/me', auth, async (req, res) => {
  try {
    const userId = (req as any).userId as number
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const doctor = await prisma.doctor.findFirst({ where: { email: user.email } })
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })
    return res.json({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      service: doctor.service,
      status: doctor.status,
      created_at: doctor.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/me', auth, async (req, res) => {
  try {
    const userId = (req as any).userId as number
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const { name, specialization, phone, department } = req.body as any
    const doctor = await prisma.doctor.findFirst({ where: { email: user.email } })
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })
    const updated = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        name: typeof name === 'string' ? name : doctor.name,
        specialization: typeof specialization === 'string' ? specialization : doctor.specialization,
        phone: typeof phone === 'string' ? phone : doctor.phone,
        // schema uses 'service' but UI uses 'department'
        service: typeof department === 'string' ? department : doctor.service,
      },
    })
    return res.json({
      id: updated.id,
      name: updated.name,
      specialization: updated.specialization,
      email: updated.email,
      phone: updated.phone,
      department: updated.service,
      status: updated.status,
      created_at: updated.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, specialization, email, phone, service, status } = req.body as any
    if (!name || !specialization || !email || !phone || !service) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const created = await prisma.doctor.create({
      data: { name, specialization, email, phone, service, status: status || 'available' },
    })
    res.status(201).json({
      id: created.id,
      name: created.name,
      specialization: created.specialization,
      email: created.email,
      phone: created.phone,
      service: created.service,
      status: created.status,
      created_at: created.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    const { name, specialization, email, phone, service, status } = req.body as any
    if (!name || !specialization || !email || !phone || !service) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const updated = await prisma.doctor.update({
      where: { id },
      data: { name, specialization, email, phone, service, status: status || 'available' },
    })
    res.json({
      id: updated.id,
      name: updated.name,
      specialization: updated.specialization,
      email: updated.email,
      phone: updated.phone,
      service: updated.service,
      status: updated.status,
      created_at: updated.createdAt,
    })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    await prisma.doctor.delete({ where: { id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

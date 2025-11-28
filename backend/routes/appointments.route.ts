import express from 'express'
import prisma from '../prisma/prismaClient'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const appts = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } })
    const payload = appts.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      description: a.description ?? '',
      appointment_date: a.appointmentDate.toISOString(),
      status: a.status,
      service_id: a.serviceId,
      created_at: a.createdAt,
    }))
    res.json(payload)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, email, gender, description, serviceId, date, time } = req.body as any
    if (!name || !email || !serviceId || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const svcId = Number(serviceId)
    if (!Number.isInteger(svcId)) return res.status(400).json({ message: 'Invalid serviceId' })
    const service = await prisma.service.findUnique({ where: { id: svcId } })
    if (!service) return res.status(404).json({ message: 'Service not found' })

    const iso = `${String(date)}T${String(time)}:00`
    const when = new Date(iso)
    if (Number.isNaN(when.getTime())) return res.status(400).json({ message: 'Invalid date/time' })

    const desc = description ? String(description) : ''
    const finalDesc = gender ? `${desc}${desc ? ' | ' : ''}gender:${String(gender)}` : desc

    const created = await prisma.appointment.create({
      data: {
        name: String(name),
        email: String(email),
        phone: '',
        description: finalDesc || null,
        appointmentDate: when,
        serviceId: svcId,
      },
    })
    res.status(201).json({
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      description: created.description ?? '',
      appointment_date: created.appointmentDate.toISOString(),
      status: created.status,
      service_id: created.serviceId,
      created_at: created.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


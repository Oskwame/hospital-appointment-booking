import express from 'express'
import prisma from '../prisma/prismaClient'
import auth from '../middleware/auth'

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
      doctor_id: a.doctorId,
      created_at: a.createdAt,
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

    // Find doctor by email
    const doctor = await prisma.doctor.findFirst({ where: { email: user.email } })
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })

    // Get only appointments assigned to this doctor
    const appts = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' }
    })

    const payload = appts.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      description: a.description ?? '',
      appointment_date: a.appointmentDate.toISOString(),
      status: a.status,
      service_id: a.serviceId,
      doctor_id: a.doctorId,
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

    // Find an available doctor with matching service
    const availableDoctor = await prisma.doctor.findFirst({
      where: {
        service: service.name,
        status: 'available',
      },
    })

    const created = await prisma.appointment.create({
      data: {
        name: String(name),
        email: String(email),
        phone: '',
        description: finalDesc || null,
        appointmentDate: when,
        serviceId: svcId,
        doctorId: availableDoctor?.id || null,
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
      doctor_id: created.doctorId,
      created_at: created.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/appointments/:id - Update appointment status (DOCTOR only)
router.patch('/:id', auth, async (req, res) => {
  try {
    const userId = (req as any).userId as number
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const appointmentId = parseInt(req.params.id)
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' })
    }

    const { status } = req.body as { status?: string }
    if (!status) {
      return res.status(400).json({ message: 'Status is required' })
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    // Get user and verify they're a doctor
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const doctor = await prisma.doctor.findFirst({ where: { email: user.email } })
    if (!doctor) return res.status(403).json({ message: 'Only doctors can update appointments' })

    // Get appointment and verify it belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    if (appointment.doctorId !== doctor.id) {
      return res.status(403).json({ message: 'You can only update your own appointments' })
    }

    // Update the appointment
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      description: updated.description ?? '',
      appointment_date: updated.appointmentDate.toISOString(),
      status: updated.status,
      service_id: updated.serviceId,
      doctor_id: updated.doctorId,
      created_at: updated.createdAt,
    })
  } catch (err) {
    console.error('Update appointment error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


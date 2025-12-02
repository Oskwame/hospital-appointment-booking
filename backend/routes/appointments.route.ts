import express from 'express'
import prisma from '../prisma/prismaClient'
import auth from '../middleware/auth'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const appts = await prisma.appointment.findMany({
      include: {
        doctor: true
      },
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
      doctor_name: a.doctor?.name || null,
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
      include: {
        doctor: true
      },
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
      doctor_name: a.doctor?.name || null,
      created_at: a.createdAt,
    }))
    res.json(payload)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, email, gender, description, serviceId, date, session } = req.body as any
    if (!name || !email || !serviceId || !date || !session) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Map session to time
    let time: string
    switch (session.toLowerCase()) {
      case 'morning':
        time = '07:00'
        break
      case 'afternoon':
        time = '11:00'
        break
      case 'evening':
        time = '15:00'
        break
      default:
        return res.status(400).json({ message: 'Invalid session. Must be morning, afternoon, or evening' })
    }

    const svcId = Number(serviceId)
    if (!Number.isInteger(svcId)) return res.status(400).json({ message: 'Invalid serviceId' })
    const service = await prisma.service.findUnique({ where: { id: svcId } })
    if (!service) return res.status(404).json({ message: 'Service not found' })

    const iso = `${String(date)}T${time}:00`
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
      session: session,
      created_at: created.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/appointments/:id - Update appointment status (DOCTOR) or reassign (ADMIN)
router.patch('/:id', auth, async (req, res) => {
  try {
    const userId = (req as any).userId as number
    const userRole = (req as any).userRole as string
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const appointmentId = parseInt(req.params.id)
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' })
    }

    const { status, doctorId } = req.body as { status?: string, doctorId?: number }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    // Logic for DOCTORS: Can only update status of their own appointments
    if (userRole === 'DOCTOR') {
      if (!status) {
        return res.status(400).json({ message: 'Status is required' })
      }

      const validStatuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled']
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid status value' })
      }

      const doctor = await prisma.doctor.findFirst({ where: { email: user.email } })
      if (!doctor) return res.status(403).json({ message: 'Doctor profile not found' })

      if (appointment.doctorId !== doctor.id) {
        return res.status(403).json({ message: 'You can only update your own appointments' })
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status },
      })

      return res.json(formatAppointment(updated))
    }

    // Logic for ADMINS/SUPERADMINS: Can reassign doctor and update status
    if (['ADMIN', 'SUPERADMIN'].includes(userRole)) {
      const updateData: any = {}

      if (status) {
        const validStatuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled']
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({ message: 'Invalid status value' })
        }
        updateData.status = status
      }

      if (doctorId) {
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
        updateData.doctorId = doctorId
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: updateData,
        include: { doctor: true }
      })

      return res.json({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        description: updated.description ?? '',
        appointment_date: updated.appointmentDate.toISOString(),
        status: updated.status,
        service_id: updated.serviceId,
        doctor_id: updated.doctorId,
        doctor_name: updated.doctor?.name || null,
        session: (updated as any).session || null,
        created_at: updated.createdAt,
      })
    }

    return res.status(403).json({ message: 'Forbidden' })

  } catch (err) {
    console.error('Update appointment error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

function formatAppointment(a: any) {
  return {
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
  }
}

export default router


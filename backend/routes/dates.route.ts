import express from 'express'
import prisma from '../prisma/prismaClient'

const router = express.Router()

// GET /api/dates - Only return future dates
router.get('/', async (_req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison

    const dates = await prisma.availableDate.findMany({
      where: {
        appointmentDate: {
          gte: today // Only get dates greater than or equal to today
        }
      },
      orderBy: { appointmentDate: 'asc' }
    })

    const payload = dates.map((d) => ({
      id: d.id,
      appointment_date: d.appointmentDate.toISOString().slice(0, 10),
      is_available: d.isAvailable,
    }))
    res.json(payload)
  } catch (err) {
    console.error('Fetch dates error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/dates
router.post('/', async (req, res) => {
  try {
    const { appointment_date } = req.body as { appointment_date?: string }
    if (!appointment_date) return res.status(400).json({ message: 'appointment_date is required' })
    const date = new Date(appointment_date)
    if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid date' })
    const created = await prisma.availableDate.create({ data: { appointmentDate: date } })
    res.status(201).json({
      id: created.id,
      appointment_date: created.appointmentDate.toISOString().slice(0, 10),
      is_available: created.isAvailable,
    })
  } catch (err) {
    console.error('Create date error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/dates/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { is_available } = req.body as { is_available?: boolean }
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    if (typeof is_available !== 'boolean') return res.status(400).json({ message: 'is_available must be boolean' })
    const updated = await prisma.availableDate.update({ where: { id }, data: { isAvailable: is_available } })
    res.json({
      id: updated.id,
      appointment_date: updated.appointmentDate.toISOString().slice(0, 10),
      is_available: updated.isAvailable,
    })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Update date error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/dates/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    await prisma.availableDate.delete({ where: { id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Delete date error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/dates/cleanup/past - Clean up past dates
router.delete('/cleanup/past', async (_req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await prisma.availableDate.deleteMany({
      where: {
        appointmentDate: {
          lt: today // Delete dates less than today
        }
      }
    })

    res.json({
      message: 'Past dates cleaned up successfully',
      deleted_count: result.count
    })
  } catch (err) {
    console.error('Cleanup dates error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


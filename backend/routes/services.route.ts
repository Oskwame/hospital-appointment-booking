import express from 'express'
import prisma from '../prisma/prismaClient'

const router = express.Router()

// GET /api/services
router.get('/', async (_req, res) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day

    const payload = services.map((s) => {
      // Filter out past dates from availableDates
      const allDates = (s as any).availableDates || []
      const futureDates = allDates.filter((d: Date) => {
        const dateObj = new Date(d)
        return dateObj >= today
      })

      return {
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        icon: (s as any).icon ?? null,
        availableDates: futureDates.map((d: Date) => d.toISOString()),
        timeSlots: (s as any).timeSlots || [],
        availableSessions: (s as any).availableSessions || ['morning', 'afternoon', 'evening'],
        created_at: s.createdAt,
      }
    })
    res.json(payload)
  } catch (err) {
    console.error('Fetch services error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/services
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, availableDates, timeSlots, availableSessions } = req.body as any
    if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })

    // Validate availableSessions
    const validSessions = ['morning', 'afternoon', 'evening']
    const sessions = Array.isArray(availableSessions)
      ? availableSessions.filter(s => validSessions.includes(s))
      : ['morning', 'afternoon', 'evening']

    const dates = Array.isArray(availableDates)
      ? availableDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()))
      : []
    const created = await prisma.service.create({
      data: {
        name,
        description,
        icon: icon || null,
        availableDates: dates as any,
        timeSlots: Array.isArray(timeSlots) ? timeSlots : [],
        availableSessions: sessions
      } as any,
    })
    res.status(201).json({
      id: created.id,
      name: created.name,
      description: created.description ?? '',
      icon: (created as any).icon ?? null,
      availableDates: (created as any).availableDates ? (created as any).availableDates.map((d: Date) => d.toISOString()) : [],
      timeSlots: (created as any).timeSlots || [],
      availableSessions: (created as any).availableSessions || ['morning', 'afternoon', 'evening'],
      created_at: created.createdAt,
    })
  } catch (err) {
    console.error('Create service error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/services/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    const { name, description, icon, availableDates, timeSlots, availableSessions } = req.body as any
    if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })

    // Validate availableSessions
    const validSessions = ['morning', 'afternoon', 'evening']
    const sessions = Array.isArray(availableSessions)
      ? availableSessions.filter(s => validSessions.includes(s))
      : ['morning', 'afternoon', 'evening']

    const dates = Array.isArray(availableDates)
      ? availableDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()))
      : []
    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        icon: icon || null,
        availableDates: dates as any,
        timeSlots: Array.isArray(timeSlots) ? timeSlots : [],
        availableSessions: sessions
      } as any,
    })
    res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description ?? '',
      icon: (updated as any).icon ?? null,
      availableDates: (updated as any).availableDates ? (updated as any).availableDates.map((d: Date) => d.toISOString()) : [],
      timeSlots: (updated as any).timeSlots || [],
      availableSessions: (updated as any).availableSessions || ['morning', 'afternoon', 'evening'],
      created_at: updated.createdAt,
    })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Update service error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })
    await prisma.service.delete({ where: { id } })
    res.json({ message: 'Deleted' })
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Not found' })
    console.error('Delete service error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

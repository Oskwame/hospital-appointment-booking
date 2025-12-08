"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const router = express_1.default.Router();
// GET /api/services
router.get('/', async (_req, res) => {
    try {
        const services = await prismaClient_1.default.service.findMany({ orderBy: { createdAt: 'desc' } });
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        const payload = services.map((s) => {
            // Filter out past dates from availableDates
            const allDates = s.availableDates || [];
            const futureDates = allDates.filter((d) => {
                const dateObj = new Date(d);
                return dateObj >= today;
            });
            return {
                id: s.id,
                name: s.name,
                description: s.description ?? '',
                icon: s.icon ?? null,
                availableDates: futureDates.map((d) => d.toISOString()),
                timeSlots: s.timeSlots || [],
                availableSessions: s.availableSessions || ['morning', 'afternoon', 'evening'],
                created_at: s.createdAt,
            };
        });
        res.json(payload);
    }
    catch (err) {
        console.error('Fetch services error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/services
router.post('/', async (req, res) => {
    try {
        const { name, description, icon, availableDates, timeSlots, availableSessions } = req.body;
        if (!name || !description)
            return res.status(400).json({ message: 'Name and description are required' });
        // Validate availableSessions
        const validSessions = ['morning', 'afternoon', 'evening'];
        const sessions = Array.isArray(availableSessions)
            ? availableSessions.filter(s => validSessions.includes(s))
            : ['morning', 'afternoon', 'evening'];
        const dates = Array.isArray(availableDates)
            ? availableDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()))
            : [];
        const created = await prismaClient_1.default.service.create({
            data: {
                name,
                description,
                icon: icon || null,
                availableDates: dates,
                timeSlots: Array.isArray(timeSlots) ? timeSlots : [],
                availableSessions: sessions
            },
        });
        res.status(201).json({
            id: created.id,
            name: created.name,
            description: created.description ?? '',
            icon: created.icon ?? null,
            availableDates: created.availableDates ? created.availableDates.map((d) => d.toISOString()) : [],
            timeSlots: created.timeSlots || [],
            availableSessions: created.availableSessions || ['morning', 'afternoon', 'evening'],
            created_at: created.createdAt,
        });
    }
    catch (err) {
        console.error('Create service error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT /api/services/:id
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        const { name, description, icon, availableDates, timeSlots, availableSessions } = req.body;
        if (!name || !description)
            return res.status(400).json({ message: 'Name and description are required' });
        // Validate availableSessions
        const validSessions = ['morning', 'afternoon', 'evening'];
        const sessions = Array.isArray(availableSessions)
            ? availableSessions.filter(s => validSessions.includes(s))
            : ['morning', 'afternoon', 'evening'];
        const dates = Array.isArray(availableDates)
            ? availableDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()))
            : [];
        const updated = await prismaClient_1.default.service.update({
            where: { id },
            data: {
                name,
                description,
                icon: icon || null,
                availableDates: dates,
                timeSlots: Array.isArray(timeSlots) ? timeSlots : [],
                availableSessions: sessions
            },
        });
        res.json({
            id: updated.id,
            name: updated.name,
            description: updated.description ?? '',
            icon: updated.icon ?? null,
            availableDates: updated.availableDates ? updated.availableDates.map((d) => d.toISOString()) : [],
            timeSlots: updated.timeSlots || [],
            availableSessions: updated.availableSessions || ['morning', 'afternoon', 'evening'],
            created_at: updated.createdAt,
        });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        console.error('Update service error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        await prismaClient_1.default.service.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        console.error('Delete service error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

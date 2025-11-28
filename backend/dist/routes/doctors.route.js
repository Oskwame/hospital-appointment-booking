"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const doctors = await prismaClient_1.default.doctor.findMany({ orderBy: { createdAt: 'desc' } });
        const payload = doctors.map((d) => ({
            id: d.id,
            name: d.name,
            specialization: d.specialization,
            email: d.email,
            phone: d.phone,
            department: d.department,
            status: d.status,
            created_at: d.createdAt,
        }));
        res.json(payload);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/me', auth_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const doctor = await prismaClient_1.default.doctor.findFirst({ where: { email: user.email } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor profile not found' });
        return res.json({
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization,
            email: doctor.email,
            phone: doctor.phone,
            department: doctor.department,
            status: doctor.status,
            created_at: doctor.createdAt,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, specialization, email, phone, department, status } = req.body;
        if (!name || !specialization || !email || !phone || !department) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const created = await prismaClient_1.default.doctor.create({
            data: { name, specialization, email, phone, department, status: status || 'available' },
        });
        res.status(201).json({
            id: created.id,
            name: created.name,
            specialization: created.specialization,
            email: created.email,
            phone: created.phone,
            department: created.department,
            status: created.status,
            created_at: created.createdAt,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        const { name, specialization, email, phone, department, status } = req.body;
        if (!name || !specialization || !email || !phone || !department) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const updated = await prismaClient_1.default.doctor.update({
            where: { id },
            data: { name, specialization, email, phone, department, status: status || 'available' },
        });
        res.json({
            id: updated.id,
            name: updated.name,
            specialization: updated.specialization,
            email: updated.email,
            phone: updated.phone,
            department: updated.department,
            status: updated.status,
            created_at: updated.createdAt,
        });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        await prismaClient_1.default.doctor.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

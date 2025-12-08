"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// GET /api/reports/overview
router.get('/overview', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        const { startDate, endDate } = req.query;
        const dateFilter = startDate && endDate ? {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } : undefined;
        // Total appointments
        const totalAppointments = await prismaClient_1.default.appointment.count({
            where: dateFilter
        });
        // Completed appointments
        const completedAppointments = await prismaClient_1.default.appointment.count({
            where: {
                status: 'completed',
                ...(dateFilter || {})
            }
        });
        // Unique patients (by email)
        const appointments = await prismaClient_1.default.appointment.findMany({
            where: dateFilter,
            select: { email: true }
        });
        const uniquePatients = new Set(appointments.map(a => a.email)).size;
        res.json({
            totalAppointments,
            completedAppointments,
            uniquePatients
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/appointments-by-service
router.get('/appointments-by-service', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        const { startDate, endDate } = req.query;
        const appointments = await prismaClient_1.default.appointment.groupBy({
            by: ['serviceId'],
            _count: { id: true },
            where: startDate && endDate ? {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            } : undefined
        });
        // Get service names
        const servicesMap = await prismaClient_1.default.service.findMany();
        const data = appointments.map(item => {
            const service = servicesMap.find(s => s.id === item.serviceId);
            return {
                serviceName: service?.name || 'Unknown',
                count: item._count.id
            };
        });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/doctor-workload
router.get('/doctor-workload', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        const { startDate, endDate } = req.query;
        const appointments = await prismaClient_1.default.appointment.groupBy({
            by: ['doctorId'],
            _count: { id: true },
            where: {
                doctorId: { not: null },
                ...(startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {})
            }
        });
        const doctors = await prismaClient_1.default.doctor.findMany();
        const data = appointments.map(item => {
            const doctor = doctors.find(d => d.id === item.doctorId);
            return {
                doctorName: doctor?.name || 'Unknown',
                appointmentCount: item._count.id,
                specialization: doctor?.specialization || 'N/A'
            };
        }).sort((a, b) => b.appointmentCount - a.appointmentCount);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/cancellations
router.get('/cancellations', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        const { startDate, endDate } = req.query;
        const total = await prismaClient_1.default.appointment.count({
            where: startDate && endDate ? {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            } : undefined
        });
        const cancelled = await prismaClient_1.default.appointment.count({
            where: {
                status: 'cancelled',
                ...(startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {})
            }
        });
        const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : '0.00';
        res.json({
            total,
            cancelled,
            completed: total - cancelled,
            cancellationRate: parseFloat(cancellationRate)
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/peak-hours
router.get('/peak-hours', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        const { startDate, endDate } = req.query;
        const appointments = await prismaClient_1.default.appointment.findMany({
            where: startDate && endDate ? {
                appointmentDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            } : undefined,
            select: { appointmentDate: true }
        });
        // Group by hour
        const hourCounts = {};
        appointments.forEach(apt => {
            const hour = new Date(apt.appointmentDate).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const data = Object.entries(hourCounts).map(([hour, count]) => ({
            hour: parseInt(hour),
            hourLabel: `${parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour)}:00 ${parseInt(hour) >= 12 ? 'PM' : 'AM'}`,
            count
        })).sort((a, b) => a.hour - b.hour);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/new-patients
router.get('/new-patients', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Access denied. Reports are only available to super admins.' });
        }
        // Get unique patients by email per month
        const appointments = await prismaClient_1.default.appointment.findMany({
            select: { email: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });
        // Track first appointment per patient
        const firstAppointments = new Map();
        appointments.forEach(apt => {
            if (!firstAppointments.has(apt.email)) {
                firstAppointments.set(apt.email, apt.createdAt);
            }
        });
        // Group by month
        const monthCounts = {};
        firstAppointments.forEach(date => {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        });
        const data = Object.entries(monthCounts).map(([month, count]) => ({
            month,
            newPatients: count
        })).sort((a, b) => a.month.localeCompare(b.month));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

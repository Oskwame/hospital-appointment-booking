"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const auth_1 = __importDefault(require("../middleware/auth"));
const email_service_1 = require("../services/email.service");
const validators_1 = require("../utils/validators");
const sanitization_1 = require("../utils/sanitization");
const audit_service_1 = require("../services/audit.service");
const index_1 = require("../index");
const router = express_1.default.Router();
router.get('/', auth_1.default, async (req, res) => {
    try {
        const userRole = req.userRole;
        const userId = req.userId;
        if (userRole === 'DOCTOR') {
            // Find doctor profile
            const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            const doctor = await prismaClient_1.default.doctor.findFirst({ where: { email: user.email } });
            if (!doctor)
                return res.status(404).json({ message: 'Doctor profile not found' });
            const appts = await prismaClient_1.default.appointment.findMany({
                where: { doctorId: doctor.id },
                include: {
                    doctor: true,
                    service: true
                },
                orderBy: { createdAt: 'desc' }
            });
            const payload = appts.map((a) => ({
                id: a.id,
                name: a.name,
                email: a.email,
                phone: a.phone,
                description: a.description ?? '',
                appointment_date: a.appointmentDate.toISOString(),
                status: a.status,
                service_id: a.serviceId,
                service_name: a.service?.name || 'General',
                doctor_id: a.doctorId,
                doctor_name: a.doctor?.name || null,
                session: a.session,
                time_slot: a.timeSlot,
                created_at: a.createdAt,
            }));
            return res.json(payload);
        }
        if (['ADMIN', 'SUPERADMIN'].includes(userRole)) {
            const appts = await prismaClient_1.default.appointment.findMany({
                include: {
                    doctor: true,
                    service: true
                },
                orderBy: { createdAt: 'desc' }
            });
            const payload = appts.map((a) => ({
                id: a.id,
                name: a.name,
                email: a.email,
                phone: a.phone,
                description: a.description ?? '',
                appointment_date: a.appointmentDate.toISOString(),
                status: a.status,
                service_id: a.serviceId,
                service_name: a.service?.name || 'General',
                doctor_id: a.doctorId,
                doctor_name: a.doctor?.name || null,
                session: a.session,
                time_slot: a.timeSlot,
                created_at: a.createdAt,
            }));
            return res.json(payload);
        }
        return res.status(403).json({ message: 'Forbidden' });
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
        // Find doctor by email
        const doctor = await prismaClient_1.default.doctor.findFirst({ where: { email: user.email } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor profile not found' });
        // Get only appointments assigned to this doctor
        const appts = await prismaClient_1.default.appointment.findMany({
            where: { doctorId: doctor.id },
            include: {
                doctor: true
            },
            orderBy: { createdAt: 'desc' }
        });
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
            session: a.session,
            time_slot: a.timeSlot,
            created_at: a.createdAt,
        }));
        res.json(payload);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', index_1.appointmentLimiter, async (req, res) => {
    try {
        const { name, email, gender, description, serviceId, date, session } = req.body;
        // Validate required fields
        if (!name || !email || !serviceId || !date || !session) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Validate email format
        if (!(0, validators_1.isValidEmail)(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Map session to time
        let time;
        // Check if specific time was provided
        const providedTime = req.body.time;
        if (providedTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(providedTime)) {
            time = providedTime;
        }
        else {
            // Fallback to session default
            switch (session.toLowerCase()) {
                case 'morning':
                    time = '07:00';
                    break;
                case 'afternoon':
                    time = '11:00';
                    break;
                case 'evening':
                    time = '15:00';
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid session. Must be morning, afternoon, or evening' });
            }
        }
        const svcId = Number(serviceId);
        if (!Number.isInteger(svcId))
            return res.status(400).json({ message: 'Invalid serviceId' });
        const service = await prismaClient_1.default.service.findUnique({ where: { id: svcId } });
        if (!service)
            return res.status(404).json({ message: 'Service not found' });
        // Safe date parsing: ensure we use only the YYYY-MM-DD part if provided string is too long
        const dateStr = String(date).split('T')[0];
        const iso = `${dateStr}T${time}:00`;
        const when = new Date(iso);
        if (Number.isNaN(when.getTime()))
            return res.status(400).json({ message: 'Invalid date/time' });
        // Prevent booking past dates
        const now = new Date();
        if (when < now) {
            return res.status(400).json({
                message: 'Cannot book appointments for past dates. Please select a future date and time.'
            });
        }
        const desc = description ? String(description) : '';
        // Sanitize description to prevent XSS
        const sanitizedDesc = (0, sanitization_1.sanitizeText)(desc);
        const finalDesc = gender ? `${sanitizedDesc}${sanitizedDesc ? ' | ' : ''}gender:${String(gender)}` : sanitizedDesc;
        // Find an available doctor with matching service
        const availableDoctor = await prismaClient_1.default.doctor.findFirst({
            where: {
                service: service.name,
                status: 'available',
            },
        });
        const created = await prismaClient_1.default.appointment.create({
            data: {
                name: String(name),
                email: String(email),
                phone: '',
                description: finalDesc || null,
                appointmentDate: when,
                serviceId: svcId,
                doctorId: availableDoctor?.id || null,
                session: session,
                timeSlot: (providedTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(providedTime)) ? providedTime : null,
            },
        });
        // Audit log appointment creation
        const ipAddress = req.headers['x-forwarded-for'] || req.ip;
        (0, audit_service_1.logAppointmentCreation)(created.id, created.email, ipAddress).catch(err => console.error('[AUDIT] Failed to log appointment creation:', err));
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
            session: created.session,
            time_slot: created.timeSlot,
            created_at: created.createdAt,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// PATCH /api/appointments/:id - Update appointment status (DOCTOR) or reassign (ADMIN)
router.patch('/:id', auth_1.default, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const appointmentId = parseInt(req.params.id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID' });
        }
        const { status, doctorId } = req.body;
        // Get user
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Get appointment
        const appointment = await prismaClient_1.default.appointment.findUnique({
            where: { id: appointmentId }
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Logic for DOCTORS: Can only update status of their own appointments
        if (userRole === 'DOCTOR') {
            if (!status) {
                return res.status(400).json({ message: 'Status is required' });
            }
            const validStatuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status.toLowerCase())) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            const doctor = await prismaClient_1.default.doctor.findFirst({ where: { email: user.email } });
            if (!doctor)
                return res.status(403).json({ message: 'Doctor profile not found' });
            if (appointment.doctorId !== doctor.id) {
                return res.status(403).json({ message: 'You can only update your own appointments' });
            }
            const updated = await prismaClient_1.default.appointment.update({
                where: { id: appointmentId },
                data: { status },
                include: { doctor: true, service: true }
            });
            // Send email if status changed to confirmed
            if (status === 'confirmed' && appointment.status !== 'confirmed') {
                console.log('📧 Doctor approved appointment, preparing to send email...');
                console.log('Previous status:', appointment.status);
                console.log('New status:', status);
                console.log('Recipient email:', updated.email);
                const time = updated.appointmentDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                // Send email asynchronously
                (0, email_service_1.sendAppointmentConfirmation)(updated.email, updated.name, updated.appointmentDate, time, updated.doctor?.name || 'Assigned Doctor', updated.service?.name || 'General Consultation', updated.id).then(() => {
                    console.log('✅ Email sent successfully to:', updated.email);
                }).catch(err => {
                    console.error('❌ Failed to send confirmation email:', err);
                });
            }
            return res.json(formatAppointment(updated));
        }
        // Logic for ADMINS/SUPERADMINS: Can reassign doctor and update status
        if (['ADMIN', 'SUPERADMIN'].includes(userRole)) {
            const updateData = {};
            if (status) {
                const validStatuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled'];
                if (!validStatuses.includes(status.toLowerCase())) {
                    return res.status(400).json({ message: 'Invalid status value' });
                }
                updateData.status = status;
            }
            if (doctorId) {
                const doctor = await prismaClient_1.default.doctor.findUnique({ where: { id: doctorId } });
                if (!doctor)
                    return res.status(404).json({ message: 'Doctor not found' });
                updateData.doctorId = doctorId;
            }
            const updated = await prismaClient_1.default.appointment.update({
                where: { id: appointmentId },
                data: updateData,
                include: { doctor: true, service: true }
            });
            // Send email if status changed to confirmed
            if (status === 'confirmed' && appointment.status !== 'confirmed') {
                console.log('📧 Status changed to confirmed, preparing to send email...');
                console.log('Previous status:', appointment.status);
                console.log('New status:', status);
                console.log('Recipient email:', updated.email);
                const time = updated.appointmentDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                // Send email asynchronously (don't await to avoid blocking response)
                (0, email_service_1.sendAppointmentConfirmation)(updated.email, updated.name, updated.appointmentDate, time, updated.doctor?.name || 'Assigned Doctor', updated.service?.name || 'General Consultation', updated.id // Add appointment ID
                ).then(() => {
                    console.log('✅ Email sent successfully to:', updated.email);
                }).catch(err => {
                    console.error('❌ Failed to send confirmation email:', err);
                });
            }
            else {
                console.log('ℹ️ Email not triggered. Status:', status, '| Previous:', appointment.status);
            }
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
                session: updated.session || null,
                created_at: updated.createdAt,
            });
        }
        return res.status(403).json({ message: 'Forbidden' });
    }
    catch (err) {
        console.error('Update appointment error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
function formatAppointment(a) {
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
    };
}
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//routes/auth.route.ts
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../middleware/auth"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_service_1 = require("../services/email.service");
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
// simple in-memory preferences per user
const userPrefs = new Map();
// simple in-memory hospital settings
let hospitalSettings = {
    hospitalName: 'Kasa Family Hospital',
    email: 'info@kasa.com',
    phone: '+1 234-567-8900',
    address: '123 Healthcare Avenue, Medical City',
    timezone: 'UTC-5',
    dataRetention: '2 years',
};
function createTransport() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !port || !user || !pass)
        return null;
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}
// POST /api/auth/login
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate token with role
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ token });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/logout', (_req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out' });
});
// POST /api/auth/users/request-otp (SUPERADMIN only)
router.post('/users/request-otp', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'Email is required' });
        const code = String(Math.floor(100000 + Math.random() * 900000));
        otpStore.set(email, { code, expires: Date.now() + OTP_TTL_MS });
        try {
            await (0, email_service_1.sendOTP)(email, code, 10);
        }
        catch (emailError) {
            console.log('[DEV] OTP for', email, 'is', code);
            console.error('Failed to send OTP email:', emailError);
        }
        return res.json({ message: 'OTP sent' });
    }
    catch (err) {
        console.error('Request OTP error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// GET current user's preferences
router.get('/preferences', auth_1.default, async (req, res) => {
    const id = req.userId;
    const prefs = userPrefs.get(id) || { autoApproval: false, emailNotifications: true };
    res.json(prefs);
});
// Update current user's preferences
router.put('/preferences', auth_1.default, async (req, res) => {
    const id = req.userId;
    const { autoApproval, emailNotifications } = req.body;
    const current = userPrefs.get(id) || { autoApproval: false, emailNotifications: true };
    const updated = {
        autoApproval: typeof autoApproval === 'boolean' ? autoApproval : current.autoApproval,
        emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : current.emailNotifications,
    };
    userPrefs.set(id, updated);
    res.json(updated);
});
// Hospital settings (SUPERADMIN only)
router.get('/hospital', auth_1.default, async (req, res) => {
    const role = String(req.userRole || '').toUpperCase();
    if (role !== 'SUPERADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    res.json(hospitalSettings);
});
router.put('/hospital', auth_1.default, async (req, res) => {
    const role = String(req.userRole || '').toUpperCase();
    if (role !== 'SUPERADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const payload = req.body;
    hospitalSettings = { ...hospitalSettings, ...payload };
    res.json(hospitalSettings);
});
// POST /api/auth/users  (SUPERADMIN only)
router.post('/users', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { email, password, role: newRole, otp } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const targetRole = String(newRole || 'ADMIN').toUpperCase();
        if (!['ADMIN', 'DOCTOR'].includes(targetRole)) {
            return res.status(400).json({ message: 'Role must be ADMIN or DOCTOR' });
        }
        const rec = otpStore.get(email);
        if (!rec || !otp || rec.code !== String(otp) || rec.expires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        const exists = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const created = await prismaClient_1.default.user.create({ data: { email, password: hashed, role: targetRole } });
        if (targetRole === 'DOCTOR') {
            await prismaClient_1.default.doctor.create({
                data: {
                    name: 'Pending Name',
                    specialization: 'General',
                    email: created.email,
                    phone: 'Pending Phone',
                    service: 'General',
                    status: 'available',
                },
            });
        }
        otpStore.delete(email);
        return res.status(201).json({ id: created.id, email: created.email, role: created.role });
    }
    catch (err) {
        console.error('Create user error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/auth/users  (SUPERADMIN only)
router.get('/users', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const users = await prismaClient_1.default.user.findMany({
            where: {
                deletedAt: null, // Only active users
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                deletedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.json(users);
    }
    catch (err) {
        console.error('Fetch users error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/auth/users/deactivated  (SUPERADMIN only)
router.get('/users/deactivated', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const users = await prismaClient_1.default.user.findMany({
            where: {
                deletedAt: { not: null }, // Only deactivated users
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                deletedAt: true,
            },
            orderBy: {
                deletedAt: 'desc',
            },
        });
        return res.json(users);
    }
    catch (err) {
        console.error('Fetch deactivated users error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/me', auth_1.default, async (req, res) => {
    try {
        const user = await prismaClient_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, role: true, createdAt: true },
        });
        if (!user)
            return res.status(404).json({ message: 'Not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Request OTP for email change
router.post('/request-email-change-otp', auth_1.default, async (req, res) => {
    try {
        const { newEmail } = req.body;
        if (!newEmail || typeof newEmail !== 'string') {
            return res.status(400).json({ message: 'New email is required' });
        }
        // Check if email is already in use
        const existing = await prismaClient_1.default.user.findUnique({ where: { email: newEmail } });
        if (existing) {
            return res.status(409).json({ message: 'Email is already in use' });
        }
        const code = String(Math.floor(100000 + Math.random() * 900000));
        otpStore.set(newEmail, { code, expires: Date.now() + OTP_TTL_MS });
        try {
            await (0, email_service_1.sendOTP)(newEmail, code, 10);
        }
        catch (emailError) {
            console.log('[DEV] Email Change OTP for', newEmail, 'is', code);
            console.error('Failed to send email change OTP:', emailError);
        }
        res.json({ message: 'OTP sent' });
    }
    catch (err) {
        console.error('Request OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/profile', auth_1.default, async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userId = req.userId;
        if (!email || typeof email !== 'string')
            return res.status(400).json({ message: 'Invalid email' });
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // If email is changing, verify OTP
        if (email !== user.email) {
            if (!otp) {
                return res.status(400).json({ message: 'OTP is required to change email' });
            }
            const rec = otpStore.get(email);
            if (!rec || rec.code !== String(otp) || rec.expires < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }
            // Check if email is taken (double check)
            const existing = await prismaClient_1.default.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(409).json({ message: 'Email is already in use' });
            }
            otpStore.delete(email);
        }
        const updated = await prismaClient_1.default.user.update({ where: { id: userId }, data: { email } });
        // If user is a doctor, update doctor record too
        if (user.role === 'DOCTOR') {
            await prismaClient_1.default.doctor.updateMany({
                where: { email: user.email }, // use old email to find
                data: { email: updated.email }
            });
        }
        res.json({ id: updated.id, email: updated.email });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/password', auth_1.default, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: req.userId } });
        if (!user)
            return res.status(404).json({ message: 'Not found' });
        const ok = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!ok)
            return res.status(401).json({ message: 'Invalid current password' });
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        await prismaClient_1.default.user.update({ where: { id: user.id }, data: { password: hashed } });
        res.json({ message: 'Password updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// PATCH /api/auth/users/:id  (SUPERADMIN only)
router.patch('/users/:id', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const { email, password, role: newRole } = req.body;
        // Validate role if provided
        if (newRole) {
            const targetRole = String(newRole).toUpperCase();
            if (!['ADMIN', 'DOCTOR'].includes(targetRole)) {
                return res.status(400).json({ message: 'Role must be ADMIN or DOCTOR' });
            }
        }
        // Check if user exists
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Build update data
        const updateData = {};
        if (email) {
            // Check if email is already taken by another user
            const emailExists = await prismaClient_1.default.user.findFirst({
                where: { email, id: { not: userId } }
            });
            if (emailExists) {
                return res.status(409).json({ message: 'Email already in use' });
            }
            updateData.email = email;
        }
        if (newRole) {
            updateData.role = String(newRole).toUpperCase();
        }
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        }
        // Update the user
        const updated = await prismaClient_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        // If email changed and user is a doctor, update doctor record
        if (email && user.role === 'DOCTOR') {
            await prismaClient_1.default.doctor.updateMany({
                where: { email: user.email },
                data: { email }
            });
        }
        return res.json(updated);
    }
    catch (err) {
        console.error('Update user error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/auth/users/:id  (SUPERADMIN only) - Soft Delete
router.delete('/users/:id', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        // Prevent deactivating yourself
        if (userId === req.userId) {
            return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Soft delete by setting deletedAt
        await prismaClient_1.default.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() }
        });
        return res.json({ message: 'User deactivated successfully' });
    }
    catch (err) {
        console.error('Deactivate user error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// PATCH /api/auth/users/:id/restore  (SUPERADMIN only) - Reactivate user
router.patch('/users/:id/restore', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Reactivate by clearing deletedAt
        await prismaClient_1.default.user.update({
            where: { id: userId },
            data: { deletedAt: null }
        });
        return res.json({ message: 'User activated successfully' });
    }
    catch (err) {
        console.error('Activate user error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

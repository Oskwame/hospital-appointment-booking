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
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
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
        const transporter = createTransport();
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
        const body = `Your verification code is ${code}. It expires in 10 minutes.`;
        if (transporter) {
            await transporter.sendMail({ from, to: email, subject: 'Your OTP Code', text: body });
        }
        else {
            console.log('[DEV] OTP for', email, 'is', code);
        }
        return res.json({ message: 'OTP sent' });
    }
    catch (err) {
        console.error('Request OTP error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
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
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
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
router.put('/profile', auth_1.default, async (req, res) => {
    try {
        if (String(req.userRole).toUpperCase() !== 'ADMIN')
            return res.status(403).json({ message: 'Forbidden' });
        const { email } = req.body;
        const updated = await prismaClient_1.default.user.update({ where: { id: req.userId }, data: { email } });
        res.json({ id: updated.id, email: updated.email });
    }
    catch (err) {
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
// DELETE /api/auth/users/:id  (SUPERADMIN only)
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
        // Prevent deleting yourself
        if (userId === req.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await prismaClient_1.default.user.delete({ where: { id: userId } });
        return res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

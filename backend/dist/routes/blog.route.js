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
        const blogs = await prismaClient_1.default.blog.findMany({ orderBy: { createdAt: 'desc' } });
        const payload = blogs.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            excerpt: b.excerpt ?? '',
            date: b.publishedAt ? b.publishedAt.toISOString().slice(0, 10) : b.createdAt.toISOString().slice(0, 10),
            category: b.category,
            status: b.status,
            content: b.content,
            image: b.imageUrl ?? '',
        }));
        res.json(payload);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (!['ADMIN', 'SUPERADMIN'].includes(role))
            return res.status(403).json({ message: 'Forbidden' });
        const { title, author, excerpt, date, category, status, content, image } = req.body;
        const created = await prismaClient_1.default.blog.create({
            data: {
                title,
                author,
                excerpt: excerpt || '',
                category,
                status: status === 'published' ? 'published' : 'draft',
                content,
                imageUrl: image || null,
                publishedAt: date ? new Date(date) : null,
            },
        });
        const payload = {
            id: created.id,
            title: created.title,
            author: created.author,
            excerpt: created.excerpt ?? '',
            date: created.publishedAt ? created.publishedAt.toISOString().slice(0, 10) : created.createdAt.toISOString().slice(0, 10),
            category: created.category,
            status: created.status,
            content: created.content,
            image: created.imageUrl ?? '',
        };
        res.status(201).json(payload);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:id', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (!['ADMIN', 'SUPERADMIN'].includes(role))
            return res.status(403).json({ message: 'Forbidden' });
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        const { title, author, excerpt, date, category, status, content, image } = req.body;
        const updated = await prismaClient_1.default.blog.update({
            where: { id },
            data: {
                title,
                author,
                excerpt: excerpt || '',
                category,
                status: status === 'published' ? 'published' : 'draft',
                content,
                imageUrl: image || null,
                publishedAt: date ? new Date(date) : null,
            },
        });
        const payload = {
            id: updated.id,
            title: updated.title,
            author: updated.author,
            excerpt: updated.excerpt ?? '',
            date: updated.publishedAt ? updated.publishedAt.toISOString().slice(0, 10) : updated.createdAt.toISOString().slice(0, 10),
            category: updated.category,
            status: updated.status,
            content: updated.content,
            image: updated.imageUrl ?? '',
        };
        res.json(payload);
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', auth_1.default, async (req, res) => {
    try {
        const role = String(req.userRole || '').toUpperCase();
        if (!['ADMIN', 'SUPERADMIN'].includes(role))
            return res.status(403).json({ message: 'Forbidden' });
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        await prismaClient_1.default.blog.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

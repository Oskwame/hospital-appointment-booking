"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const sanitization_1 = require("../utils/sanitization");
const router = express_1.default.Router();
// GET /api/posts
router.get('/', async (_req, res) => {
    try {
        const blogs = await prismaClient_1.default.blog.findMany({ orderBy: { createdAt: 'desc' } });
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        const payload = blogs.map(blog => ({
            ...blog,
            imageUrl: blog.imageUrl ? (blog.imageUrl.startsWith('http') ? blog.imageUrl : `${baseUrl}${blog.imageUrl}`) : null
        }));
        res.json(payload);
    }
    catch (err) {
        console.error('Fetch posts error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/posts/:id
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        const blog = await prismaClient_1.default.blog.findUnique({ where: { id } });
        if (!blog)
            return res.status(404).json({ message: 'Post not found' });
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        const payload = {
            ...blog,
            imageUrl: blog.imageUrl ? (blog.imageUrl.startsWith('http') ? blog.imageUrl : `${baseUrl}${blog.imageUrl}`) : null
        };
        res.json(payload);
    }
    catch (err) {
        console.error('Fetch post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/posts
router.post('/', async (req, res) => {
    try {
        const { title, content, category, author, excerpt, status, image_url } = req.body;
        // Basic validation
        if (!title || !content || !author) {
            return res.status(400).json({ message: 'Title, content, and author are required' });
        }
        const blog = await prismaClient_1.default.blog.create({
            data: {
                title: (0, sanitization_1.sanitizeText)(title),
                content: (0, sanitization_1.sanitizeBlogContent)(content),
                category: category || 'General',
                author: (0, sanitization_1.sanitizeText)(author),
                excerpt: excerpt ? (0, sanitization_1.sanitizeText)(excerpt) : undefined,
                status: status || 'draft',
                imageUrl: image_url
            }
        });
        res.status(201).json(blog);
    }
    catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT /api/posts/:id
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        const { title, content, category, author, excerpt, status, image_url } = req.body;
        const blog = await prismaClient_1.default.blog.update({
            where: { id },
            data: {
                title: (0, sanitization_1.sanitizeText)(title),
                content: (0, sanitization_1.sanitizeBlogContent)(content),
                category,
                author: (0, sanitization_1.sanitizeText)(author),
                excerpt: excerpt ? (0, sanitization_1.sanitizeText)(excerpt) : undefined,
                status,
                imageUrl: image_url
            }
        });
        res.json(blog);
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        console.error('Update post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id))
            return res.status(400).json({ message: 'Invalid id' });
        await prismaClient_1.default.blog.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        if (err?.code === 'P2025')
            return res.status(404).json({ message: 'Not found' });
        console.error('Delete post error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;

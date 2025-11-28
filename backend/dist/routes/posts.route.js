"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const router = express_1.default.Router();
// GET /api/posts
router.get('/', async (_req, res) => {
    try {
        const blogs = await prismaClient_1.default.blog.findMany({ orderBy: { createdAt: 'desc' } });
        const payload = blogs.map((b) => ({
            id: b.id,
            title: b.title,
            content: b.content,
            category: b.category,
            author: b.author,
            image_url: b.imageUrl ?? null,
            created_at: b.createdAt,
        }));
        res.json(payload);
    }
    catch (err) {
        console.error('Fetch posts error:', err);
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

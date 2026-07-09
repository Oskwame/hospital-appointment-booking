"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    try {
        const teamMembers = await prismaClient_1.default.teamMember.findMany({
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });
        res.json(teamMembers);
    }
    catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const teamMember = await prismaClient_1.default.teamMember.findUnique({
            where: { id: parseInt(id) },
        });
        if (!teamMember) {
            return res.status(404).json({ message: "Team member not found" });
        }
        res.json(teamMember);
    }
    catch (error) {
        console.error("Error fetching team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name, title, imageSrc, specialty, email, phone, category, order } = req.body;
        if (!name || !title || !imageSrc) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const created = await prismaClient_1.default.teamMember.create({
            data: {
                name,
                title,
                imageSrc,
                specialty,
                email,
                phone,
                category: category || "leadership",
                order: order || 0,
            },
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error("Error creating team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, imageSrc, specialty, email, phone, category, order } = req.body;
        const updated = await prismaClient_1.default.teamMember.update({
            where: { id: parseInt(id) },
            data: {
                name,
                title,
                imageSrc,
                specialty,
                email,
                phone,
                category,
                order,
            },
        });
        res.json(updated);
    }
    catch (error) {
        if (error?.code === "P2025")
            return res.status(404).json({ message: "Not found" });
        console.error("Error updating team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.teamMember.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Deleted" });
    }
    catch (error) {
        if (error?.code === "P2025")
            return res.status(404).json({ message: "Not found" });
        console.error("Error deleting team member:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;

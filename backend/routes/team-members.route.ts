import express from "express";
import prisma from "../prisma/prismaClient";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: parseInt(id) },
    });
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, title, imageSrc, specialty, email, phone, category, order } =
      req.body;
    if (!name || !title || !imageSrc) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const created = await prisma.teamMember.create({
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
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, imageSrc, specialty, email, phone, category, order } =
      req.body;
    const updated = await prisma.teamMember.update({
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
  } catch (error: any) {
    if (error?.code === "P2025")
      return res.status(404).json({ message: "Not found" });
    console.error("Error updating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teamMember.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Deleted" });
  } catch (error: any) {
    if (error?.code === "P2025")
      return res.status(404).json({ message: "Not found" });
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

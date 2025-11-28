"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = "admin@example.com";
    const password = "admin12345";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("Admin already exists:", email);
    }
    else {
        const hashed = await bcryptjs_1.default.hash(password, 10);
        await prisma.user.create({ data: { email, password: hashed, role: "ADMIN" } });
        console.log("Seeded admin:", email, "password:", password);
    }
    const doctorEmail = "doctor@example.com";
    const doctorPass = "Doctor123";
    const existingDoctor = await prisma.user.findUnique({ where: { email: doctorEmail } });
    if (!existingDoctor) {
        const hashedDoctor = await bcryptjs_1.default.hash(doctorPass, 10);
        await prisma.user.create({ data: { email: doctorEmail, password: hashedDoctor, role: "DOCTOR" } });
        console.log("Seeded doctor:", doctorEmail, "password:", doctorPass);
    }
    else {
        console.log("Doctor already exists:", doctorEmail);
    }
    const superEmail = "superadmin@example.com";
    const superPass = "SuperAdmin123!";
    const existingSuper = await prisma.user.findUnique({ where: { email: superEmail } });
    if (!existingSuper) {
        const hashedSuper = await bcryptjs_1.default.hash(superPass, 10);
        await prisma.user.create({ data: { email: superEmail, password: hashedSuper, role: "SUPERADMIN" } });
        console.log("Seeded superadmin:", superEmail);
    }
    else {
        console.log("Superadmin already exists:", superEmail);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

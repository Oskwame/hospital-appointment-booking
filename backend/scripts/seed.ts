import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@example.com"
  const password = "admin12345"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("Admin already exists:", email)
  } else {
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { email, password: hashed, role: "ADMIN" } })
    console.log("Seeded admin:", email, "password:", password)
  }

  const doctorEmail = "doctor@example.com"
  const doctorPass = "Doctor123"
  const existingDoctor = await prisma.user.findUnique({ where: { email: doctorEmail } })
  if (!existingDoctor) {
    const hashedDoctor = await bcrypt.hash(doctorPass, 10)
    await prisma.user.create({ data: { email: doctorEmail, password: hashedDoctor, role: "DOCTOR" } })
    console.log("Seeded doctor:", doctorEmail, "password:", doctorPass)
  } else {
    console.log("Doctor already exists:", doctorEmail)
  }

  const superEmail = "superadmin@example.com"
  const superPass = "SuperAdmin123!"
  const existingSuper = await prisma.user.findUnique({ where: { email: superEmail } })
  if (!existingSuper) {
    const hashedSuper = await bcrypt.hash(superPass, 10)
    await prisma.user.create({ data: { email: superEmail, password: hashedSuper, role: "SUPERADMIN" } })
    console.log("Seeded superadmin:", superEmail)
  } else {
    console.log("Superadmin already exists:", superEmail)
  }

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

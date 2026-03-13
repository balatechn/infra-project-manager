import { PrismaClient } from "../src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcryptjs"
import "dotenv/config"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await hash("Natty@2026!1", 12)

  const admin = await prisma.user.upsert({
    where: { email: "bala.techn@gmail.com" },
    update: {
      hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Bala",
      email: "bala.techn@gmail.com",
      hashedPassword,
      role: "ADMIN",
      department: "Administration",
    },
  })

  console.log("Admin user seeded:", admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

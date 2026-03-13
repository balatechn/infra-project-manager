import { PrismaClient } from "../src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { compare } from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function test() {
  const user = await prisma.user.findUnique({ where: { email: "bala.techn@gmail.com" } })
  if (!user) {
    console.log("USER NOT FOUND")
    return
  }
  console.log("User found:", user.email, user.role)
  const valid = await compare("Natty@2026!1", user.hashedPassword)
  console.log("Password valid:", valid)
  await prisma.$disconnect()
}
test().catch(console.error)

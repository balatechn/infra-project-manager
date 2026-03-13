import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ step: "user_lookup", found: false })
    }

    const isValid = await compare(password, user.hashedPassword)
    return NextResponse.json({
      step: "password_check",
      found: true,
      passwordValid: isValid,
      userId: user.id,
      role: user.role,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ step: "error", error: message }, { status: 500 })
  }
}

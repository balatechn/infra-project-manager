import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      ok: true,
      userCount,
      dbUrl: process.env.DATABASE_URL ? "set" : "missing",
      authSecret: process.env.AUTH_SECRET ? "set" : "missing",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

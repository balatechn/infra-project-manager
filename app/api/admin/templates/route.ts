import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const templates = await prisma.projectTemplate.findMany({
      where,
      include: {
        defaultTasks: { orderBy: { order: "asc" } },
        _count: { select: { defaultTasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, tasks } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
    }

    const template = await prisma.projectTemplate.create({
      data: {
        name,
        description,
        category,
        defaultTasks: tasks?.length
          ? {
              create: (tasks as { title: string; description?: string; order: number; daysOffset: number; duration: number }[]).map(
                (t, i) => ({
                  title: t.title,
                  description: t.description || null,
                  order: t.order ?? i,
                  daysOffset: t.daysOffset ?? 0,
                  duration: t.duration ?? 1,
                })
              ),
            }
          : undefined,
      },
      include: {
        defaultTasks: { orderBy: { order: "asc" } },
        _count: { select: { defaultTasks: true } },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

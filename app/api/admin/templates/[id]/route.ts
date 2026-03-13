import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, category, isActive, tasks } = body;

    // Update template
    const template = await prisma.projectTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Replace tasks if provided
    if (tasks) {
      await prisma.templateTask.deleteMany({ where: { templateId: id } });
      await prisma.templateTask.createMany({
        data: (tasks as { title: string; description?: string; order: number; daysOffset: number; duration: number }[]).map((t, i) => ({
          title: t.title,
          description: t.description || null,
          order: t.order ?? i,
          daysOffset: t.daysOffset ?? 0,
          duration: t.duration ?? 1,
          templateId: id,
        })),
      });
    }

    const updated = await prisma.projectTemplate.findUnique({
      where: { id },
      include: {
        defaultTasks: { orderBy: { order: "asc" } },
        _count: { select: { defaultTasks: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.projectTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

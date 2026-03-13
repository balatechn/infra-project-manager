import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.startDate) body.startDate = new Date(body.startDate);

    const task = await prisma.task.update({
      where: { id },
      data: body,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Update project progress
    if (body.status) {
      const projectStats = await prisma.task.groupBy({
        by: ["status"],
        where: { projectId: task.projectId },
        _count: true,
      });
      const total = projectStats.reduce((sum, s) => sum + s._count, 0);
      const done = projectStats.find((s) => s.status === "DONE")?._count || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      await prisma.project.update({
        where: { id: task.projectId },
        data: {
          progress,
          status: progress === 100 ? "COMPLETED" : undefined,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        action: "UPDATED",
        entity: "Task",
        entityId: id,
        userId: user.id,
        projectId: task.projectId,
        details: { fields: Object.keys(body) },
      },
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { subTasks: true, comments: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, projectId, priority, dueDate, startDate, assigneeId, parentId } =
      body;

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and projectId are required" },
        { status: 400 }
      );
    }

    // Get the max order for the project
    const maxOrder = await prisma.task.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        assigneeId,
        createdById: user.id,
        parentId,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATED",
        entity: "Task",
        entityId: task.id,
        userId: user.id,
        projectId,
        details: { taskTitle: task.title },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

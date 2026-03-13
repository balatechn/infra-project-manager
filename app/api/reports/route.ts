import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const projectId = searchParams.get("projectId");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;

    const reports = await prisma.report.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type") || "WEEKLY";

    // Generate report data
    const projectWhere = projectId ? { id: projectId } : {};
    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        tasks: true,
        milestones: true,
        vendors: { include: { vendor: true } },
      },
    });

    const reportContent = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        projectName: p.name,
        client: p.client,
        location: p.location,
        category: p.category,
        status: p.status,
        progress,
        budget: p.budget,
        spent: p.spent,
        totalTasks,
        doneTasks,
        pendingMilestones: p.milestones.filter((m) => m.status === "PENDING").length,
        endDate: p.endDate,
      };
    });

    const report = await prisma.report.create({
      data: {
        title: `${type} Report - ${new Date().toLocaleDateString()}`,
        type: type as "WEEKLY" | "MONTHLY" | "PROJECT_SUMMARY" | "BUDGET" | "CUSTOM",
        content: reportContent as unknown as Prisma.InputJsonValue,
        projectId: projectId || null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      budgetData,
      overdueTaskCount,
      recentActivity,
      projectsByCategory,
      projectsByStatus,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: "DONE" } }),
      prisma.project.aggregate({
        _sum: { budget: true, spent: true },
      }),
      prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: "DONE" },
        },
      }),
      prisma.activityLog.findMany({
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.project.groupBy({
        by: ["category"],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        totalBudget: budgetData._sum.budget || 0,
        totalSpent: budgetData._sum.spent || 0,
        overdueTaskCount,
      },
      recentActivity,
      projectsByCategory,
      projectsByStatus,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

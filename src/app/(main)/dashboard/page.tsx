"use client"

import {
  FolderKanban,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { DashboardCard } from "@/components/charts/dashboard-card"
import {
  ProjectProgressChart,
  TaskCompletionChart,
  ResourceUtilizationChart,
  IssueDistributionChart,
  BudgetOverviewChart,
} from "@/components/charts/dashboard-charts"
import { ActivityTimeline } from "@/components/activity-timeline"
import { useProjectStore } from "@/store/useProjectStore"
import { useTaskStore } from "@/store/useTaskStore"
import { useIssueStore } from "@/store/useIssueStore"
import { mockActivities, mockResources } from "@/lib/mock-data"

export default function DashboardPage() {
  const projects = useProjectStore((s) => s.projects)
  const tasks = useTaskStore((s) => s.tasks)
  const issues = useIssueStore((s) => s.issues)

  const totalProjects = projects.length
  const activeProjects = projects.filter(
    (p) => p.status === "in-progress"
  ).length
  const delayedProjects = projects.filter(
    (p) => p.health === "critical" || p.health === "at-risk"
  ).length
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length

  const projectProgressData = projects
    .filter((p) => p.status !== "completed")
    .slice(0, 8)
    .map((p) => ({ name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name, progress: p.progress }))

  const taskStatusCounts = {
    Backlog: tasks.filter((t) => t.status === "backlog").length,
    Planned: tasks.filter((t) => t.status === "planned").length,
    "In Progress": tasks.filter((t) => t.status === "in-progress").length,
    Review: tasks.filter((t) => t.status === "review").length,
    Completed: tasks.filter((t) => t.status === "completed").length,
  }
  const taskCompletionData = Object.entries(taskStatusCounts).map(
    ([name, value]) => ({ name, value })
  )

  const resourceData = mockResources.slice(0, 6).map((r) => ({
    name: r.name.split(" ")[0],
    utilization: 100 - r.availability,
    capacity: 100,
  }))

  const issueSeverityCounts = {
    Low: issues.filter((i) => i.severity === "low").length,
    Medium: issues.filter((i) => i.severity === "medium").length,
    High: issues.filter((i) => i.severity === "high").length,
    Critical: issues.filter((i) => i.severity === "critical").length,
  }
  const issueDistData = Object.entries(issueSeverityCounts).map(
    ([name, value]) => ({ name, value })
  )

  const budgetData = [
    { month: "Sep", budget: 200000, actual: 180000 },
    { month: "Oct", budget: 400000, actual: 350000 },
    { month: "Nov", budget: 600000, actual: 580000 },
    { month: "Dec", budget: 800000, actual: 790000 },
    { month: "Jan", budget: 1000000, actual: 1050000 },
    { month: "Feb", budget: 1200000, actual: 1280000 },
    { month: "Mar", budget: 1400000, actual: 1460000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Infrastructure project overview and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          description="Across all departments"
          trend={{ value: 12, label: "from last month" }}
        />
        <DashboardCard
          title="Active Projects"
          value={activeProjects}
          icon={Zap}
          description="Currently in progress"
          trend={{ value: 8, label: "from last month" }}
        />
        <DashboardCard
          title="Delayed Projects"
          value={delayedProjects}
          icon={AlertTriangle}
          description="At risk or critical"
          trend={{ value: -5, label: "from last month" }}
          className="border-l-2 border-l-destructive"
        />
        <DashboardCard
          title="Completed"
          value={completedProjects}
          icon={CheckCircle2}
          description="Successfully delivered"
          trend={{ value: 15, label: "from last month" }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectProgressChart data={projectProgressData} />
        <TaskCompletionChart data={taskCompletionData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ResourceUtilizationChart data={resourceData} />
        <IssueDistributionChart data={issueDistData} />
        <ActivityTimeline activities={mockActivities} />
      </div>

      {/* Budget Chart */}
      <div className="grid gap-4 lg:grid-cols-1">
        <BudgetOverviewChart data={budgetData} />
      </div>
    </div>
  )
}

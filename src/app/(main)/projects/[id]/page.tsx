"use client"

import { use } from "react"
import { useProjectStore } from "@/store/useProjectStore"
import { useTaskStore } from "@/store/useTaskStore"
import { useIssueStore } from "@/store/useIssueStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskTreeView } from "@/components/task-tree-view"
import { ActivityTimeline } from "@/components/activity-timeline"
import { cn, formatDate, formatCurrency, getDaysUntilDue } from "@/lib/utils"
import { mockActivities, mockRisks } from "@/lib/mock-data"
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const healthColors: Record<string, string> = {
  "on-track": "bg-green-500/10 text-green-500 border-green-500/20",
  "at-risk": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
}

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === id)
  )
  const taskTree = useTaskStore((s) => s.getTaskTree(id))
  const issues = useIssueStore((s) => s.getIssuesByProject(id))
  const projectRisks = mockRisks.filter((r) => r.projectId === id)
  const projectActivities = mockActivities.filter((a) => a.projectId === id)

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const daysUntilDue = getDaysUntilDue(project.endDate)
  const budgetUsed = Math.round((project.spent / project.budget) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {project.name}
              </h1>
              <Badge
                variant="outline"
                className={cn("capitalize", healthColors[project.health])}
              >
                {project.health.replace("-", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {project.client} · {project.projectManager}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ─── Overview ─────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progress
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.progress}%</div>
                <Progress value={project.progress} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Timeline
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {daysUntilDue > 0 ? `${daysUntilDue}d` : `${Math.abs(daysUntilDue)}d late`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(project.startDate)} → {formatDate(project.endDate)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Budget
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(project.spent)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {formatCurrency(project.budget)} ({budgetUsed}%)
                </p>
                <Progress
                  value={budgetUsed}
                  className={cn(
                    "mt-2 h-2",
                    budgetUsed > 90 && "[&>div]:bg-destructive"
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Issues
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {issues.filter((i) => i.status !== "closed" && i.status !== "resolved").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {issues.filter((i) => i.severity === "critical").length} critical
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tasks ────────────────────────────────── */}
        <TabsContent value="tasks">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Task Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTreeView tasks={taskTree} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Issues ───────────────────────────────── */}
        <TabsContent value="issues">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No issues reported
                </p>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-3"
                    >
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] shrink-0", severityColors[issue.severity])}
                      >
                        {issue.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {issue.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {issue.assignee} · {issue.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Risks ────────────────────────────────── */}
        <TabsContent value="risks">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Risks</CardTitle>
            </CardHeader>
            <CardContent>
              {projectRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No risks identified
                </p>
              ) : (
                <div className="space-y-3">
                  {projectRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="rounded-lg border border-border/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", severityColors[risk.impact])}
                        >
                          {risk.impact}
                        </Badge>
                        <span className="text-sm font-medium">{risk.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {risk.mitigationPlan}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Owner: {risk.owner} · Likelihood: {risk.likelihood}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Documents ────────────────────────────── */}
        <TabsContent value="documents">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Project Charter.pdf", "Network Design v2.docx", "Site Survey Report.pdf", "Budget Approval.xlsx"].map(
                  (doc) => (
                    <div
                      key={doc}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Activity ─────────────────────────────── */}
        <TabsContent value="activity">
          <ActivityTimeline activities={projectActivities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

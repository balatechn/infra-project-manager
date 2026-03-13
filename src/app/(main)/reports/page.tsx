"use client"

import { useState } from "react"
import { useProjectStore } from "@/store/useProjectStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  BarChart3,
} from "lucide-react"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const reportTypes = [
  {
    id: "weekly",
    title: "Weekly Report",
    description: "Summary of the past week's activities and progress",
    icon: Calendar,
    period: "Mar 7 – Mar 13, 2026",
  },
  {
    id: "monthly",
    title: "Monthly Report",
    description: "Comprehensive monthly performance overview",
    icon: BarChart3,
    period: "March 2026",
  },
  {
    id: "project-status",
    title: "Project Status Report",
    description: "Detailed status of individual projects",
    icon: FileText,
    period: "As of Mar 13, 2026",
  },
]

export default function ReportsPage() {
  const projects = useProjectStore((s) => s.projects)
  const [selectedProject, setSelectedProject] = useState("all")

  const reportProjects =
    selectedProject === "all"
      ? projects
      : projects.filter((p) => p.id === selectedProject)

  const progressData = reportProjects.slice(0, 8).map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
    progress: p.progress,
    budget: Math.round((p.spent / p.budget) * 100),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export project reports
          </p>
        </div>
        <Select value={selectedProject} onValueChange={(v) => setSelectedProject(v ?? "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 sm:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.id}
              className="glass border-border/50 hover:border-primary/20 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.period}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.description}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Project Status</TabsTrigger>
          <TabsTrigger value="progress">Progress Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Project Status Summary
              </CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="w-[140px]">Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportProjects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.client}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.projectManager}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={p.progress} className="h-1.5 flex-1" />
                          <span className="text-xs w-8">{p.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-muted-foreground">
                          {formatCurrency(p.spent)}
                        </span>
                        <span className="text-muted-foreground/60">
                          {" "}/ {formatCurrency(p.budget)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            p.health === "on-track" &&
                              "bg-green-500/10 text-green-500 border-green-500/20",
                            p.health === "at-risk" &&
                              "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                            p.health === "critical" &&
                              "bg-red-500/10 text-red-500 border-red-500/20",
                            p.health === "completed" &&
                              "bg-green-500/10 text-green-500 border-green-500/20"
                          )}
                        >
                          {p.health.replace("-", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Progress vs Budget Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v, name) => [
                      `${v}%`,
                      name === "progress" ? "Progress" : "Budget Used",
                    ]}
                  />
                  <Legend
                    formatter={(value) => (
                      <span
                        style={{ fontSize: "12px", color: "var(--foreground)" }}
                      >
                        {value === "progress" ? "Progress" : "Budget Used"}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="progress"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="budget"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useIssueStore } from "@/store/useIssueStore"
import { useProjectStore } from "@/store/useProjectStore"
import { Issue } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Search, Plus, AlertTriangle, AlertCircle, Info, XCircle } from "lucide-react"
import { useState } from "react"

const severityConfig: Record<
  string,
  { color: string; icon: typeof AlertTriangle }
> = {
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Info },
  medium: {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: AlertCircle,
  },
  high: {
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: AlertTriangle,
  },
  critical: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
}

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

function IssueCard({ issue }: { issue: Issue }) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === issue.projectId)
  )
  const SeverityIcon = severityConfig[issue.severity].icon

  return (
    <Card className="glass border-border/50 hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 rounded-lg p-1.5",
              severityConfig[issue.severity].color.split(" ")[0]
            )}
          >
            <SeverityIcon
              className={cn(
                "h-4 w-4",
                severityConfig[issue.severity].color.split(" ")[1]
              )}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{issue.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project?.name || "Unknown Project"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize",
                    severityConfig[issue.severity].color
                  )}
                >
                  {issue.severity}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize",
                    statusColors[issue.status]
                  )}
                >
                  {issue.status.replace("-", " ")}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {issue.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                    {getInitials(issue.assignee)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {issue.assignee}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {issue.resolutionDate
                  ? `Resolved ${formatDate(issue.resolutionDate)}`
                  : `Reported ${formatDate(issue.createdAt)}`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function IssuesPage() {
  const issues = useIssueStore((s) => s.issues)
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = issues.filter((i) => {
    if (
      search &&
      !i.title.toLowerCase().includes(search.toLowerCase()) &&
      !i.description.toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (severityFilter !== "all" && i.severity !== severityFilter) return false
    if (statusFilter !== "all" && i.status !== statusFilter) return false
    return true
  })

  const criticalCount = issues.filter((i) => i.severity === "critical").length
  const openCount = issues.filter(
    (i) => i.status === "open" || i.status === "in-progress"
  ).length
  const resolvedCount = issues.filter(
    (i) => i.status === "resolved" || i.status === "closed"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">
            Track and manage project issues
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-border/50 border-l-2 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 border-l-2 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 border-l-2 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issue List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No issues found
          </div>
        ) : (
          filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  )
}

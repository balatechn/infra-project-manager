"use client"

import { useState, useMemo } from "react"
import { useTaskStore } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore"
import { Task, GanttZoom } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ChevronRight, ChevronDown, Diamond } from "lucide-react"

const zoomLevels: { value: GanttZoom; label: string; days: number }[] = [
  { value: "day", label: "Day", days: 1 },
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 30 },
]

function getDateRange(tasks: Task[]): { start: Date; end: Date } {
  if (tasks.length === 0) {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth() + 6, 0),
    }
  }
  const dates = tasks.flatMap((t) => [new Date(t.startDate), new Date(t.endDate)])
  const min = new Date(Math.min(...dates.map((d) => d.getTime())))
  const max = new Date(Math.max(...dates.map((d) => d.getTime())))
  min.setDate(min.getDate() - 7)
  max.setDate(max.getDate() + 14)
  return { start: min, end: max }
}

function generateTimeHeaders(start: Date, end: Date, zoom: GanttZoom) {
  const headers: { label: string; date: Date; width: number }[] = []
  const current = new Date(start)
  const dayWidth = zoom === "day" ? 40 : zoom === "week" ? 20 : 6

  while (current <= end) {
    if (zoom === "day") {
      headers.push({
        label: current.getDate().toString(),
        date: new Date(current),
        width: dayWidth,
      })
      current.setDate(current.getDate() + 1)
    } else if (zoom === "week") {
      const weekStart = new Date(current)
      headers.push({
        label: `W${Math.ceil(current.getDate() / 7)} ${current.toLocaleDateString("en", { month: "short" })}`,
        date: weekStart,
        width: dayWidth * 7,
      })
      current.setDate(current.getDate() + 7)
    } else {
      headers.push({
        label: current.toLocaleDateString("en", {
          month: "short",
          year: "2-digit",
        }),
        date: new Date(current),
        width: dayWidth * 30,
      })
      current.setMonth(current.getMonth() + 1)
    }
  }
  return { headers, dayWidth }
}

function getBarPosition(
  taskStart: Date,
  taskEnd: Date,
  rangeStart: Date,
  dayWidth: number
) {
  const startDiff = Math.max(
    0,
    (taskStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  const duration = Math.max(
    1,
    (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  return {
    left: startDiff * dayWidth,
    width: duration * dayWidth,
  }
}

const statusColors: Record<string, string> = {
  backlog: "bg-gray-400",
  planned: "bg-blue-400",
  "in-progress": "bg-yellow-400",
  review: "bg-purple-400",
  completed: "bg-green-400",
}

interface GanttRowProps {
  task: Task
  rangeStart: Date
  dayWidth: number
  depth?: number
}

function GanttRow({ task, rangeStart, dayWidth, depth = 0 }: GanttRowProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = task.children && task.children.length > 0
  const bar = getBarPosition(
    new Date(task.startDate),
    new Date(task.endDate),
    rangeStart,
    dayWidth
  )

  return (
    <>
      <div className="flex border-b border-border/30 hover:bg-muted/30 transition-colors">
        {/* Left panel */}
        <div
          className="flex items-center gap-1 w-64 shrink-0 border-r border-border/30 px-2 py-2"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-4 w-4 shrink-0 flex items-center justify-center"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {task.type === "milestone" ? (
            <Diamond className="h-3 w-3 shrink-0 text-primary" />
          ) : null}
          <span className="text-xs truncate font-medium">{task.title}</span>
        </div>

        {/* Timeline bar */}
        <div className="flex-1 relative h-10">
          <div
            className={cn(
              "absolute top-2 h-6 rounded-sm flex items-center",
              task.type === "milestone"
                ? "bg-primary/20 border border-primary/40"
                : statusColors[task.status] + "/30"
            )}
            style={{ left: bar.left, width: Math.max(bar.width, 4) }}
          >
            {/* Progress fill */}
            <div
              className={cn(
                "h-full rounded-sm",
                statusColors[task.status]
              )}
              style={{ width: `${task.progress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground/80">
              {task.progress > 0 ? `${task.progress}%` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded &&
        hasChildren &&
        task.children!.map((child) => (
          <GanttRow
            key={child.id}
            task={child}
            rangeStart={rangeStart}
            dayWidth={dayWidth}
            depth={depth + 1}
          />
        ))}
    </>
  )
}

export default function GanttPage() {
  const [zoom, setZoom] = useState<GanttZoom>("week")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const projects = useProjectStore((s) => s.projects)
  const { tasks, getTaskTree } = useTaskStore()

  const displayTasks = useMemo(() => {
    if (selectedProject === "all") {
      const projectIds = [...new Set(tasks.map((t) => t.projectId))]
      return projectIds.flatMap((pid) => getTaskTree(pid))
    }
    return getTaskTree(selectedProject)
  }, [selectedProject, tasks, getTaskTree])

  const flatTasks =
    selectedProject === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProject)
  const range = getDateRange(flatTasks)
  const { headers, dayWidth } = generateTimeHeaders(range.start, range.end, zoom)
  const totalWidth = headers.reduce((sum, h) => sum + h.width, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gantt Chart</h1>
          <p className="text-muted-foreground">
            Project timeline and dependencies
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="flex rounded-lg border border-border overflow-hidden">
            {zoomLevels.map((z) => (
              <Button
                key={z.value}
                variant={zoom === z.value ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setZoom(z.value)}
              >
                {z.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card className="glass border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Time headers */}
          <div className="flex border-b border-border sticky top-0 bg-card z-10">
            <div className="w-64 shrink-0 border-r border-border px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Task
              </span>
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {headers.map((h, i) => (
                <div
                  key={i}
                  className="border-r border-border/30 px-1 py-2 text-center"
                  style={{ width: h.width }}
                >
                  <span className="text-[10px] text-muted-foreground">
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div>
            {displayTasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No tasks to display
              </div>
            ) : (
              displayTasks.map((task) => (
                <GanttRow
                  key={task.id}
                  task={task}
                  rangeStart={range.start}
                  dayWidth={dayWidth}
                />
              ))
            )}
          </div>

          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-destructive/50 z-20"
            style={{
              left:
                264 +
                ((new Date().getTime() - range.start.getTime()) /
                  (1000 * 60 * 60 * 24)) *
                  dayWidth,
            }}
          />
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-400" />
          <span>Backlog</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span>Planned</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-purple-400" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}

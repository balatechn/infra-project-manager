"use client"

import { Task } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useState } from "react"

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

const statusColors: Record<string, string> = {
  backlog: "bg-gray-500/10 text-gray-500",
  planned: "bg-blue-500/10 text-blue-500",
  "in-progress": "bg-yellow-500/10 text-yellow-500",
  review: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
}

function TaskNode({ task, depth = 0 }: { task: Task; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = task.children && task.children.length > 0

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group",
          depth > 0 && "ml-6"
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "shrink-0 h-5 w-5 flex items-center justify-center rounded transition-colors",
            hasChildren
              ? "hover:bg-muted text-muted-foreground"
              : "invisible"
          )}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium truncate",
                task.type === "milestone" && "font-semibold"
              )}
            >
              {task.title}
            </span>
            <Badge variant="outline" className={cn("text-[10px] shrink-0", statusColors[task.status])}>
              {task.status.replace("-", " ")}
            </Badge>
          </div>
          {task.assignee && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {task.assignee}
            </p>
          )}
        </div>

        {/* Priority */}
        <Badge variant="outline" className={cn("text-[10px] shrink-0", priorityColors[task.priority])}>
          {task.priority}
        </Badge>

        {/* Progress */}
        <div className="flex items-center gap-2 w-32 shrink-0">
          <Progress value={task.progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {task.progress}%
          </span>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {task.children!.map((child) => (
            <TaskNode key={child.id} task={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TaskTreeView({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No tasks found
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskNode key={task.id} task={task} />
      ))}
    </div>
  )
}

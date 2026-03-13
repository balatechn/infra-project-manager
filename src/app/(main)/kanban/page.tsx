"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTaskStore } from "@/store/useTaskStore"
import { Task, TaskStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn, getInitials } from "@/lib/utils"
import { GripVertical } from "lucide-react"

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "border-t-gray-500" },
  { id: "planned", title: "Planned", color: "border-t-blue-500" },
  { id: "in-progress", title: "In Progress", color: "border-t-yellow-500" },
  { id: "review", title: "Review", color: "border-t-purple-500" },
  { id: "completed", title: "Completed", color: "border-t-green-500" },
]

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card p-3 space-y-2 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("text-[10px]", priorityColors[task.priority])}
        >
          {task.priority}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">
          {task.type}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={task.progress} className="h-1.5 flex-1" />
        <span className="text-[10px] text-muted-foreground">
          {task.progress}%
        </span>
      </div>
      {task.assignee && (
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
              {getInitials(task.assignee)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{task.assignee}</span>
        </div>
      )}
    </div>
  )
}

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  )
}

export default function KanbanPage() {
  const { tasks, moveTask } = useTaskStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const droppedOnColumn = columns.find((c) => c.id === over.id)

    if (droppedOnColumn) {
      moveTask(taskId, droppedOnColumn.id)
      return
    }

    const droppedOnTask = tasks.find((t) => t.id === over.id)
    if (droppedOnTask && droppedOnTask.status) {
      moveTask(taskId, droppedOnTask.status)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id)
            return (
              <div key={column.id} className="w-72 shrink-0">
                <Card
                  className={cn(
                    "border-t-2 glass border-border/50",
                    column.color
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {column.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SortableContext
                      id={column.id}
                      items={columnTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 min-h-[200px]">
                        {columnTasks.map((task) => (
                          <SortableTask key={task.id} task={task} />
                        ))}
                      </div>
                    </SortableContext>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

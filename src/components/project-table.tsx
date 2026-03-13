"use client"

import { Project } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatDate } from "@/lib/utils"
import Link from "next/link"

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "in-progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "on-hold": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const healthIcons: Record<string, string> = {
  "on-track": "🟢",
  "at-risk": "🟡",
  critical: "🔴",
  completed: "✅",
}

export function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <div className="rounded-lg border border-border/50 glass overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="w-[180px]">Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]">Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.client}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.projectManager}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(project.startDate)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(project.endDate)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-10 text-right">
                      {project.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      statusColors[project.status]
                    )}
                  >
                    {project.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span title={project.health}>
                    {healthIcons[project.health]}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import { useProjectStore } from "@/store/useProjectStore"
import { ProjectTable } from "@/components/project-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const projectTypes = [
  { value: "all", label: "All Types" },
  { value: "networking", label: "Networking" },
  { value: "cctv", label: "CCTV" },
  { value: "wifi", label: "WiFi" },
  { value: "data-center", label: "Data Center" },
  { value: "server", label: "Server" },
  { value: "infrastructure", label: "Infrastructure" },
]

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const managers = [
  { value: "all", label: "All Managers" },
  { value: "Sarah Chen", label: "Sarah Chen" },
  { value: "James Rodriguez", label: "James Rodriguez" },
  { value: "Michael Foster", label: "Michael Foster" },
  { value: "Emily Watson", label: "Emily Watson" },
]

export default function ProjectsPage() {
  const { filter, setFilter, getFilteredProjects } = useProjectStore()
  const filteredProjects = getFilteredProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all infrastructure projects
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filter.type}
          onValueChange={(v) => setFilter({ type: v ?? undefined })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Project Type" />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.status}
          onValueChange={(v) => setFilter({ status: v ?? undefined })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.manager}
          onValueChange={(v) => setFilter({ manager: v ?? undefined })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Manager" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ProjectTable projects={filteredProjects} />

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProjects.length} of {useProjectStore.getState().projects.length} projects
      </div>
    </div>
  )
}

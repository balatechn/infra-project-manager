"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, Button, Input, Select, Badge, Progress, Modal, EmptyState, Spinner } from "@/components/ui";
import { Plus, Search, Filter, FolderKanban, MapPin, Calendar, DollarSign } from "lucide-react";
import { formatDate, formatCurrency, getStatusColor, getPriorityColor, getCategoryLabel } from "@/lib/utils";
import type { Project, ProjectCategory, ProjectStatus, Priority } from "@/types/project-types";

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "NETWORKING", label: "Networking" },
  { value: "CCTV", label: "CCTV" },
  { value: "WIFI", label: "Wi-Fi" },
  { value: "SERVER_DEPLOYMENT", label: "Server Deployment" },
  { value: "ACCESS_CONTROL", label: "Access Control" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "IT_ASSET_ROLLOUT", label: "IT Asset Rollout" },
  { value: "VENDOR_COORDINATION", label: "Vendor Coordination" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      client: form.get("client") as string,
      location: form.get("location") as string,
      category: form.get("category") as ProjectCategory,
      startDate: form.get("startDate") as string,
      endDate: form.get("endDate") as string,
      budget: parseFloat(form.get("budget") as string),
      priority: form.get("priority") as Priority,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsCreateOpen(false);
      fetchProjects();
    }
    setCreating(false);
  };

  const priorityDot: Record<string, string> = {
    LOW: "bg-navy-300",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-amber-500",
    CRITICAL: "bg-red-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
          <p className="text-sm text-navy-500 mt-0.5">Manage IT infrastructure projects</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-navy-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "table" ? "bg-white text-navy-800 shadow-sm" : "text-navy-500 hover:text-navy-700"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white text-navy-800 shadow-sm" : "text-navy-500 hover:text-navy-700"
              }`}
            >
              Grid
            </button>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to get started"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          }
        />
      ) : viewMode === "table" ? (
        /* DATA TABLE VIEW */
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-700 text-white">
                  <th className="px-4 py-3 text-left font-bold text-xs">Project Name</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Client</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Category</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Priority</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Progress</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Budget</th>
                  <th className="px-4 py-3 text-left font-bold text-xs">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const statusBadge: Record<string, { bg: string; text: string }> = {
                    PLANNING: { bg: "bg-navy-100", text: "text-navy-700" },
                    IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700" },
                    ON_HOLD: { bg: "bg-amber-50", text: "text-amber-700" },
                    COMPLETED: { bg: "bg-green-50", text: "text-green-700" },
                    CANCELLED: { bg: "bg-red-50", text: "text-red-700" },
                  };
                  const sb = statusBadge[project.status] || statusBadge.PLANNING;
                  return (
                    <tr key={project.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/projects/${project.id}`} className="font-semibold text-navy-800 hover:text-blue-600 transition-colors">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-navy-600 text-xs">{project.client}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-navy-500">{getCategoryLabel(project.category)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${sb.bg} ${sb.text}`}>
                          {project.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${priorityDot[project.priority] || "bg-navy-300"}`} />
                          <span className="text-xs font-medium text-navy-600">{project.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                project.progress >= 80 ? "bg-green-500" : project.progress >= 40 ? "bg-blue-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-navy-700 w-8 text-right">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-navy-700">{formatCurrency(project.budget)}</td>
                      <td className="px-4 py-3 text-[11px] text-navy-500">
                        {formatDate(project.startDate)} – {formatDate(project.endDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-t-4 border-t-navy-600">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy-900 truncate">{project.name}</h3>
                      <p className="text-xs text-navy-500 mt-0.5">{project.client}</p>
                    </div>
                    <Badge variant={project.status === "COMPLETED" ? "success" : project.status === "ON_HOLD" ? "warning" : project.status === "CANCELLED" ? "danger" : "info"}>
                      {project.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-navy-500">
                    <span className="flex items-center gap-1"><Filter className="h-3 w-3" />{getCategoryLabel(project.category)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.progress >= 80 ? "bg-green-500" : project.progress >= 40 ? "bg-blue-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-navy-700">{project.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-navy-100">
                    <span className="text-navy-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${priorityDot[project.priority] || "bg-navy-300"}`} />
                      <span className="font-semibold text-navy-600">{project.priority}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-500 flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</span>
                    <span className="font-bold text-navy-800">{formatCurrency(project.budget)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input name="name" label="Project Name" placeholder="e.g. Bangalore Office IT Setup" required />
          <Input name="description" label="Description" placeholder="Brief description..." />
          <div className="grid grid-cols-2 gap-3">
            <Input name="client" label="Client" placeholder="Client name" required />
            <Input name="location" label="Location" placeholder="City / Site" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select name="category" label="Category" options={categoryOptions.slice(1)} />
            <Select name="priority" label="Priority" options={priorityOptions} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input name="startDate" label="Start Date" type="date" required />
            <Input name="endDate" label="End Date" type="date" required />
          </div>
          <Input name="budget" label="Budget (USD)" type="number" placeholder="50000" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

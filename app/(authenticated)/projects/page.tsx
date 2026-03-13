"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Input, Select, Badge, Progress, Modal, EmptyState, Spinner } from "@/components/ui";
import { Plus, Search, Filter } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage IT infrastructure projects</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.client}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Filter className="h-3 w-3" />
                    <span>{getCategoryLabel(project.category)}</span>
                    <span>•</span>
                    <span>{project.location}</span>
                  </div>

                  <Progress value={project.progress} showLabel />

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
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

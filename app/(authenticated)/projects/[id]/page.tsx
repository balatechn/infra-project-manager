"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  Progress,
  Input,
  Select,
  Modal,
  Spinner,
  Avatar,
} from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getPriorityColor,
  getCategoryLabel,
} from "@/lib/utils";
import type { Project, Task } from "@/types/project-types";

const taskStatusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      setProject(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        projectId: id,
        priority: form.get("priority"),
        dueDate: form.get("dueDate") || null,
      }),
    });
    if (res.ok) {
      setIsTaskModalOpen(false);
      fetchProject();
    }
    setCreating(false);
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const tasks = (project.tasks || []) as Task[];
  const tasksByStatus = taskStatusOptions.map((s) => ({
    ...s,
    tasks: tasks.filter((t) => t.status === s.value),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDeleteProject}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Timeline</p>
              <p className="text-sm font-medium">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium">{project.location}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500 mb-2">
              {getCategoryLabel(project.category)} • {project.priority}
            </p>
            <Progress value={project.progress} showLabel />
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
            <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-0">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No tasks yet. Add tasks to track progress.
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    {taskStatusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 truncate">{task.description}</p>
                    )}
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  {task.assignee && (
                    <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendors Section */}
      {project.vendors && project.vendors.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Assigned Vendors</h2>
          </CardHeader>
          <CardContent className="py-0">
            <div className="divide-y">
              {project.vendors.map((pv) => (
                <div key={pv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{pv.vendor?.name}</p>
                    <p className="text-xs text-gray-500">{pv.scope}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(pv.value)}</p>
                    <Badge variant={pv.status === "active" ? "success" : "default"}>{pv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input name="title" label="Task Title" placeholder="e.g. Install network switches" required />
          <Input name="description" label="Description" placeholder="Optional description..." />
          <div className="grid grid-cols-2 gap-3">
            <Select name="priority" label="Priority" options={priorityOptions} />
            <Input name="dueDate" label="Due Date" type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

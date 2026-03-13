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
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  formatDate,
  formatCurrency,
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
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-navy-500">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const tasks = (project.tasks || []) as Task[];
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const budgetPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

  const priorityDot: Record<string, string> = {
    LOW: "bg-navy-300",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-amber-500",
    CRITICAL: "bg-red-500",
  };

  const statusStyle: Record<string, string> = {
    TODO: "bg-navy-100 text-navy-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    IN_REVIEW: "bg-purple-50 text-purple-700",
    DONE: "bg-green-50 text-green-700",
    BLOCKED: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="w-9 h-9 rounded-lg bg-navy-100 hover:bg-navy-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-navy-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">{project.name}</h1>
              <Badge variant={project.status === "COMPLETED" ? "success" : project.status === "ON_HOLD" ? "warning" : project.status === "CANCELLED" ? "danger" : "info"}>
                {project.status.replace(/_/g, " ")}
              </Badge>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${priorityDot[project.priority] || "bg-navy-300"}`} />
                <span className="text-xs font-semibold text-navy-500">{project.priority}</span>
              </div>
            </div>
            <p className="text-sm text-navy-500 mt-0.5">{project.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDeleteProject} className="text-red-500 hover:bg-red-50 border-red-200">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-navy-400 uppercase">Timeline</p>
              <p className="text-sm font-bold text-navy-800">
                {formatDate(project.startDate)} – {formatDate(project.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-navy-400 uppercase">Location</p>
              <p className="text-sm font-bold text-navy-800">{project.location}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-navy-400 uppercase">Budget</p>
              <p className="text-sm font-bold text-navy-800">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${budgetPct > 100 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                </div>
                <span className="text-[10px] font-bold text-navy-500">{budgetPct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-navy-400 uppercase">{getCategoryLabel(project.category)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    project.progress >= 80 ? "bg-green-500" : project.progress >= 40 ? "bg-blue-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-navy-800">{project.progress}%</span>
            </div>
            <p className="text-[11px] text-navy-400 mt-1 font-semibold">{doneTasks}/{tasks.length} tasks done</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader className="bg-navy-50 border-b border-navy-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-navy-600" />
              Tasks ({tasks.length})
            </h2>
            <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-navy-400 text-sm">
              No tasks yet. Add tasks to track progress.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-700 text-white">
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Status</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Task</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Priority</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Assignee</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        className={`rounded-md px-2 py-1 text-[11px] font-bold border-0 cursor-pointer ${statusStyle[task.status] || "bg-navy-100 text-navy-700"}`}
                      >
                        {taskStatusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className={`text-sm font-semibold ${task.status === "DONE" ? "line-through text-navy-300" : "text-navy-800"}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-navy-400 truncate max-w-xs">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority] || "bg-navy-300"}`} />
                        <span className="text-xs font-medium text-navy-600">{task.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                          <span className="text-xs font-medium text-navy-600">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-navy-300">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-navy-500">
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Vendors Section */}
      {project.vendors && project.vendors.length > 0 && (
        <Card>
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h2 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-navy-600" /> Assigned Vendors
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-700 text-white">
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Vendor</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Scope</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Value</th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {project.vendors.map((pv) => (
                  <tr key={pv.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-navy-800">{pv.vendor?.name}</td>
                    <td className="px-4 py-2.5 text-xs text-navy-500">{pv.scope}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-navy-700">{formatCurrency(pv.value)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={pv.status === "active" ? "success" : "default"}>{pv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

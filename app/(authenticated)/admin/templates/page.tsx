"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Badge,
  Modal,
  Select,
  Spinner,
  EmptyState,
  StatCard,
} from "@/components/ui";
import {
  Plus,
  FileStack,
  Trash2,
  Edit3,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  Network,
  Shield,
  Wifi,
  HardDrive,
  Camera,
  Database,
  Package,
  Truck,
} from "lucide-react";
import { getCategoryLabel } from "@/lib/utils";
import type { ProjectTemplate, TemplateTask, ProjectCategory } from "@/types/project-types";

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

const categoryIcons: Record<string, React.ReactNode> = {
  NETWORKING: <Network className="h-4 w-4" />,
  CCTV: <Camera className="h-4 w-4" />,
  WIFI: <Wifi className="h-4 w-4" />,
  SERVER_DEPLOYMENT: <HardDrive className="h-4 w-4" />,
  ACCESS_CONTROL: <Shield className="h-4 w-4" />,
  DATA_CENTER: <Database className="h-4 w-4" />,
  IT_ASSET_ROLLOUT: <Package className="h-4 w-4" />,
  VENDOR_COORDINATION: <Truck className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  NETWORKING: "border-blue-500",
  CCTV: "border-purple-500",
  WIFI: "border-teal-500",
  SERVER_DEPLOYMENT: "border-orange-500",
  ACCESS_CONTROL: "border-red-500",
  DATA_CENTER: "border-indigo-500",
  IT_ASSET_ROLLOUT: "border-emerald-500",
  VENDOR_COORDINATION: "border-amber-500",
  OTHER: "border-navy-400",
};

export default function ProjectTemplatesPage() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Task form state
  const [taskRows, setTaskRows] = useState<{ title: string; daysOffset: string; duration: string }[]>([
    { title: "", daysOffset: "0", duration: "1" },
  ]);

  const fetchTemplates = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("category", filter);
    const res = await fetch(`/api/admin/templates?${params}`);
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, [filter]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const tasks = taskRows
      .filter((t) => t.title.trim())
      .map((t, i) => ({
        title: t.title.trim(),
        order: i,
        daysOffset: parseInt(t.daysOffset) || 0,
        duration: parseInt(t.duration) || 1,
      }));

    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        category: form.get("category"),
        tasks,
      }),
    });

    if (res.ok) {
      setIsCreateOpen(false);
      setTaskRows([{ title: "", daysOffset: "0", duration: "1" }]);
      fetchTemplates();
    }
    setCreating(false);
  };

  const toggleActive = async (template: ProjectTemplate) => {
    await fetch(`/api/admin/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !template.isActive }),
    });
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  const addTaskRow = () => {
    setTaskRows([...taskRows, { title: "", daysOffset: "0", duration: "1" }]);
  };

  const removeTaskRow = (index: number) => {
    setTaskRows(taskRows.filter((_, i) => i !== index));
  };

  const updateTaskRow = (index: number, field: string, value: string) => {
    const updated = [...taskRows];
    updated[index] = { ...updated[index], [field]: value };
    setTaskRows(updated);
  };

  const activeCount = templates.filter((t) => t.isActive).length;
  const totalTasks = templates.reduce((s, t) => s + (t._count?.defaultTasks || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Project Templates</h1>
          <p className="text-sm text-navy-500 mt-0.5">
            Pre-configured templates for IT infrastructure projects
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Templates" value={templates.length} color="blue" icon={<FileStack className="w-5 h-5" />} />
        <StatCard title="Active" value={activeCount} color="green" icon={<Power className="w-5 h-5" />} />
        <StatCard title="Inactive" value={templates.length - activeCount} color="amber" icon={<PowerOff className="w-5 h-5" />} />
        <StatCard title="Total Tasks" value={totalTasks} color="purple" icon={<ListChecks className="w-5 h-5" />} />
      </div>

      {/* Filter */}
      <Select
        options={categoryOptions}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-56"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates found"
          description="Create project templates for quick project setup"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isExpanded = expandedId === template.id;
            return (
              <Card
                key={template.id}
                className={`border-t-4 ${categoryColors[template.category] || "border-navy-400"} ${
                  !template.isActive ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">
                        {categoryIcons[template.category] || <FileStack className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-800">{template.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={template.isActive ? "success" : "warning"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-navy-400">
                            {getCategoryLabel(template.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleActive(template)}
                        className="p-1.5 rounded-md hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                        title={template.isActive ? "Deactivate" : "Activate"}
                      >
                        {template.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-navy-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {template.description && (
                    <p className="text-xs text-navy-500 mb-3">{template.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-navy-500">
                      {template._count?.defaultTasks || 0} default tasks
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-800 transition-colors"
                    >
                      {isExpanded ? "Hide" : "View"} Tasks
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {isExpanded && template.defaultTasks && template.defaultTasks.length > 0 && (
                    <div className="mt-3 border-t border-navy-100 pt-3 space-y-1.5">
                      {template.defaultTasks.map((task: TemplateTask, i: number) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-3 py-2 bg-navy-50/50 rounded-md text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-navy-200 flex items-center justify-center text-[10px] font-bold text-navy-600">
                              {i + 1}
                            </span>
                            <span className="font-medium text-navy-700">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-navy-400">
                            <span>Day +{task.daysOffset}</span>
                            <span>{task.duration}d</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Template Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Project Template">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input name="name" label="Template Name" placeholder="e.g. Standard CCTV Installation" required />
          <Input name="description" label="Description" placeholder="Brief template description" />
          <Select
            name="category"
            label="Category"
            options={categoryOptions.filter((o) => o.value !== "")}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-2">Default Tasks</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {taskRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-navy-400 text-center">{i + 1}</span>
                  <Input
                    placeholder="Task title"
                    value={row.title}
                    onChange={(e) => updateTaskRow(i, "title", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Day"
                    value={row.daysOffset}
                    onChange={(e) => updateTaskRow(i, "daysOffset", e.target.value)}
                    className="w-16"
                    type="number"
                  />
                  <Input
                    placeholder="Dur"
                    value={row.duration}
                    onChange={(e) => updateTaskRow(i, "duration", e.target.value)}
                    className="w-16"
                    type="number"
                  />
                  {taskRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTaskRow(i)}
                      className="p-1 text-navy-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTaskRow}
              className="mt-2 text-xs font-semibold text-navy-600 hover:text-navy-800 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Task
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

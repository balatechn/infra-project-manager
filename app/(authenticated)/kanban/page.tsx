"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, Button, Badge, Select, Spinner, Avatar, EmptyState } from "@/components/ui";
import { GripVertical, Plus } from "lucide-react";
import { getPriorityColor, formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/project-types";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "border-t-slate-400" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-t-yellow-400" },
  { id: "IN_REVIEW", title: "In Review", color: "border-t-purple-400" },
  { id: "DONE", title: "Done", color: "border-t-green-400" },
  { id: "BLOCKED", title: "Blocked", color: "border-t-red-400" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedProject) params.set("projectId", selectedProject);

    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [selectedProject]);

  useEffect(() => {
    fetch("/api/projects?limit=100")
      .then((r) => r.json())
      .then((d) =>
        setProjects(
          (d.projects || []).map((p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name,
          }))
        )
      );
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropEvent = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) handleDrop(taskId, status);
  };

  const projectOptions = [
    { value: "", label: "All Projects" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-500 mt-1">Drag and drop tasks between columns</p>
        </div>
        <Select
          options={projectOptions}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="Create tasks in your projects to see them on the board" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 bg-gray-100 rounded-xl border-t-4 ${column.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropEvent(e, column.id)}
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {column.title}
                  </h3>
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="px-3 pb-3 space-y-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {task.project && (
                            <p className="text-xs text-gray-500 mt-0.5">{task.project.name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[10px] text-gray-400">
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                          {task.assignee && (
                            <div className="mt-2">
                              <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

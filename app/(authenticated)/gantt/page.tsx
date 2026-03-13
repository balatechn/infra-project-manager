"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, Select, Spinner, EmptyState } from "@/components/ui";
import { getStatusColor, getPriorityColor } from "@/lib/utils";
import type { Project, Task } from "@/types/project-types";

export default function GanttPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      });
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/tasks?projectId=${selectedProject}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [selectedProject]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  // Calculate timeline
  const getTimelineRange = () => {
    if (!selectedProjectData) return { start: new Date(), end: new Date(), days: 30 };
    const start = new Date(selectedProjectData.startDate);
    const end = new Date(selectedProjectData.endDate);
    const days = Math.max(
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      30
    );
    return { start, end, days };
  };

  const { start: timelineStart, days: totalDays } = getTimelineRange();

  const getBarPosition = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (!startDate || !selectedProjectData) return { left: 0, width: 0 };
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dayStart = Math.max(
      0,
      Math.floor((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return {
      left: (dayStart / totalDays) * 100,
      width: Math.min((duration / totalDays) * 100, 100 - (dayStart / totalDays) * 100),
    };
  };

  // Generate month labels
  const getMonthLabels = () => {
    const labels: { label: string; left: number }[] = [];
    const current = new Date(timelineStart);
    while (current <= new Date(timelineStart.getTime() + totalDays * 24 * 60 * 60 * 1000)) {
      const dayNum = Math.floor(
        (current.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      labels.push({
        label: current.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        left: (dayNum / totalDays) * 100,
      });
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    return labels;
  };

  const projectOptions = [
    { value: "", label: "Select a project" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gantt Chart</h1>
          <p className="text-gray-500 mt-1">Visualize project timeline and task schedules</p>
        </div>
        <Select
          options={projectOptions}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-72"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : !selectedProject ? (
        <EmptyState title="Select a project" description="Choose a project to view its Gantt chart" />
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks" description="Add tasks to this project to visualize the timeline" />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]" ref={containerRef}>
              {/* Timeline header */}
              <div className="relative h-10 border-b bg-gray-50">
                {getMonthLabels().map((label, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center text-xs text-gray-500 font-medium border-l border-gray-200 pl-2"
                    style={{ left: `calc(250px + ${label.left}% * (100% - 250px) / 100)` }}
                  >
                    {label.label}
                  </div>
                ))}
              </div>

              {/* Project bar */}
              {selectedProjectData && (
                <div className="relative flex items-center h-12 border-b bg-blue-50">
                  <div className="w-[250px] flex-shrink-0 px-4 text-sm font-semibold text-gray-900 truncate">
                    {selectedProjectData.name}
                  </div>
                  <div className="flex-1 relative h-6 mx-2">
                    <div
                      className="absolute h-full rounded-full bg-blue-500 opacity-30"
                      style={{ left: "0%", width: "100%" }}
                    />
                  </div>
                </div>
              )}

              {/* Task rows */}
              {tasks.map((task) => {
                const bar = getBarPosition(task.startDate, task.dueDate);
                const statusColors: Record<string, string> = {
                  TODO: "bg-slate-400",
                  IN_PROGRESS: "bg-yellow-500",
                  IN_REVIEW: "bg-purple-500",
                  DONE: "bg-green-500",
                  BLOCKED: "bg-red-500",
                };
                return (
                  <div
                    key={task.id}
                    className="relative flex items-center h-10 border-b hover:bg-gray-50 group"
                  >
                    <div className="w-[250px] flex-shrink-0 px-4 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                      <span className="text-sm text-gray-700 truncate">{task.title}</span>
                    </div>
                    <div className="flex-1 relative h-6 mx-2">
                      {bar.width > 0 && (
                        <div
                          className={`absolute h-full rounded ${statusColors[task.status]} opacity-80 flex items-center justify-center`}
                          style={{
                            left: `${bar.left}%`,
                            width: `${Math.max(bar.width, 2)}%`,
                          }}
                        >
                          {bar.width > 8 && (
                            <span className="text-[10px] text-white font-medium truncate px-1">
                              {task.title}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Today marker */}
              {selectedProjectData && (() => {
                const today = new Date();
                const todayOffset = Math.floor(
                  (today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
                );
                const todayPercent = (todayOffset / totalDays) * 100;
                if (todayPercent >= 0 && todayPercent <= 100) {
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
                      style={{ left: `calc(250px + ${todayPercent}% * (100% - 250px) / 100)` }}
                    >
                      <div className="absolute -top-1 -left-2 w-4 h-1 bg-red-500 rounded" />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

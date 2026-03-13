"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, Select, Spinner, EmptyState } from "@/components/ui";
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

  const statusColors: Record<string, string> = {
    TODO: "bg-navy-400",
    IN_PROGRESS: "bg-blue-500",
    IN_REVIEW: "bg-purple-500",
    DONE: "bg-green-500",
    BLOCKED: "bg-red-500",
  };

  const statusDots: Record<string, string> = {
    TODO: "bg-navy-400",
    IN_PROGRESS: "bg-blue-500",
    IN_REVIEW: "bg-purple-500",
    DONE: "bg-green-500",
    BLOCKED: "bg-red-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Gantt Chart</h1>
          <p className="text-sm text-navy-500 mt-0.5">Visualize project timeline and task schedules</p>
        </div>
        <Select
          options={projectOptions}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-72"
        />
      </div>

      {/* Legend */}
      {selectedProject && (
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries({ TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review", DONE: "Done", BLOCKED: "Blocked" }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${statusDots[key]}`} />
              <span className="text-[11px] font-semibold text-navy-500">{label}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
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
              <div className="relative h-10 border-b border-navy-100 bg-navy-700">
                <div className="absolute left-0 top-0 w-[250px] h-full flex items-center px-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Task Name</span>
                </div>
                {getMonthLabels().map((label, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center text-[11px] text-navy-200 font-bold border-l border-navy-600 pl-2"
                    style={{ left: `calc(250px + ${label.left}% * (100% - 250px) / 100)` }}
                  >
                    {label.label}
                  </div>
                ))}
              </div>

              {/* Project bar */}
              {selectedProjectData && (
                <div className="relative flex items-center h-12 border-b border-navy-100 bg-navy-50">
                  <div className="w-[250px] flex-shrink-0 px-4 text-xs font-bold text-navy-800 truncate uppercase tracking-wide">
                    {selectedProjectData.name}
                  </div>
                  <div className="flex-1 relative h-7 mx-2">
                    <div
                      className="absolute h-full rounded bg-navy-200"
                      style={{ left: "0%", width: "100%" }}
                    />
                    <div
                      className="absolute h-full rounded bg-navy-500"
                      style={{ left: "0%", width: `${selectedProjectData.progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{selectedProjectData.progress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Task rows */}
              {tasks.map((task, idx) => {
                const bar = getBarPosition(task.startDate, task.dueDate);
                return (
                  <div
                    key={task.id}
                    className={`relative flex items-center h-10 border-b border-navy-50 hover:bg-navy-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-navy-50/30"}`}
                  >
                    <div className="w-[250px] flex-shrink-0 px-4 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusDots[task.status]}`} />
                      <span className="text-xs font-semibold text-navy-700 truncate">{task.title}</span>
                    </div>
                    <div className="flex-1 relative h-7 mx-2">
                      {bar.width > 0 && (
                        <div
                          className={`absolute h-full rounded-md ${statusColors[task.status]} flex items-center justify-center shadow-sm`}
                          style={{
                            left: `${bar.left}%`,
                            width: `${Math.max(bar.width, 2)}%`,
                          }}
                        >
                          {bar.width > 8 && (
                            <span className="text-[10px] text-white font-bold truncate px-1.5">
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
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                      style={{ left: `calc(250px + ${todayPercent}% * (100% - 250px) / 100)` }}
                    >
                      <div className="absolute -top-0.5 -left-1.5 w-4 h-1.5 bg-red-500 rounded-full" />
                      <div className="absolute top-2 -left-3 text-[9px] font-bold text-red-500 whitespace-nowrap">TODAY</div>
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

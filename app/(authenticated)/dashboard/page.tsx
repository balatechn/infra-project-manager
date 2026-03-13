"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Badge, Spinner, StatCard, ActivityItem } from "@/components/ui";
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Users,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { DashboardStats, ActivityLog } from "@/types/project-types";

interface DashboardData {
  stats: DashboardStats;
  recentActivity: (ActivityLog & { user: { id: string; name: string } })[];
  projectsByCategory: { category: string; _count: number }[];
  projectsByStatus: { status: string; _count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-10 w-10" />
          <p className="text-sm font-semibold text-navy-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentActivity, projectsByCategory, projectsByStatus } = data;
  const budgetUsage = stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0;
  const taskCompletion = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const overBudget = budgetUsage > 100;

  const phases = [
    { name: "Planning", status: (stats.completedProjects > 0 ? "completed" : stats.activeProjects > 0 ? "completed" : "in-progress") as "completed" | "in-progress" | "pending" },
    { name: "Design", status: (stats.completedProjects > 0 ? "completed" : stats.activeProjects > 0 ? "completed" : "pending") as "completed" | "in-progress" | "pending" },
    { name: "Development", status: (stats.activeProjects > 0 ? "in-progress" : stats.completedProjects > 0 ? "completed" : "pending") as "completed" | "in-progress" | "pending" },
    { name: "Testing", status: (stats.completedProjects > 0 ? "in-progress" : "pending") as "completed" | "in-progress" | "pending" },
    { name: "Launch", status: "pending" as const },
  ];

  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 121);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">IT Project Management Dashboard</h1>
          <p className="text-sm text-navy-500 mt-0.5">Real-time infrastructure project overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-navy-400">
          <Clock className="h-3.5 w-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* TOP ROW: Progress + Phase + Launch */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Overall Progress Gauge */}
        <Card className="md:col-span-3">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <svg width="120" height="120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e8eef6" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={taskCompletion >= 70 ? "#27ae60" : taskCompletion >= 40 ? "#f5a623" : "#e74c3c"}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - taskCompletion / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-navy-900">{taskCompletion}%</span>
              </div>
            </div>
            <p className="text-xs font-bold text-navy-500 mt-2 uppercase tracking-wider">Overall Progress</p>
          </CardContent>
        </Card>

        {/* Phase Tracker */}
        <Card className="md:col-span-6">
          <CardContent className="py-6">
            <div className="mb-4">
              <div className="h-2 w-full rounded-full bg-navy-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, taskCompletion + 10)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              {phases.map((phase, i) => (
                <div key={phase.name} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    phase.status === "completed" ? "bg-green-500 text-white" :
                    phase.status === "in-progress" ? "bg-amber-500 text-white" :
                    "bg-navy-100 text-navy-400"
                  }`}>
                    {phase.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold ${
                    phase.status === "completed" ? "text-green-600" :
                    phase.status === "in-progress" ? "text-amber-600" :
                    "text-navy-400"
                  }`}>
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projected Launch Date */}
        <Card className="md:col-span-3">
          <CardContent className="py-6 text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Projected Launch Date</p>
            <p className="text-sm font-semibold text-navy-700 mb-3">
              {launchDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="flex items-center justify-center gap-1">
              {String(121).split("").map((digit, i) => (
                <div key={i} className="w-9 h-11 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xl font-bold shadow-sm">
                  {digit}
                </div>
              ))}
              <span className="text-lg font-bold text-navy-800 ml-2">Days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECOND ROW: Risks + Budget + Overdue + Project Log */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Risks Panel */}
        <Card className="md:col-span-3">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Risks
            </h3>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="text-center">
              <p className={`text-3xl font-bold ${overBudget ? "text-red-500" : "text-green-600"}`}>
                {budgetUsage > 100 ? `${budgetUsage - 100}%` : `${budgetUsage}%`}
              </p>
              <p className={`text-xs font-semibold ${overBudget ? "text-red-500" : "text-green-600"}`}>
                {overBudget ? "Currently Over Target Budget" : "Within Budget Target"}
              </p>
            </div>
            <div className="h-px bg-navy-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{stats.overdueTaskCount}</p>
              <p className="text-xs font-semibold text-amber-500">Overdue Tasks (High Risk)</p>
            </div>
            <div className="h-px bg-navy-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">
                {Math.max(0, stats.totalTasks - stats.completedTasks - stats.overdueTaskCount)}
              </p>
              <p className="text-xs font-semibold text-amber-500">Pending Tasks (Medium Risk)</p>
            </div>
          </CardContent>
        </Card>

        {/* Project Budget */}
        <Card className="md:col-span-3">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" /> Project Budget
            </h3>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-600">Total Budget</span>
                </div>
                <div className="h-6 bg-navy-100 rounded overflow-hidden">
                  <div className="h-full bg-navy-600 rounded" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-600">Amount Used</span>
                </div>
                <div className="h-6 bg-navy-100 rounded overflow-hidden">
                  <div className="h-full bg-amber-500 rounded" style={{ width: `${Math.min(budgetUsage, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-600">Target Used</span>
                </div>
                <div className="h-6 bg-navy-100 rounded overflow-hidden">
                  <div className="h-full bg-navy-300 rounded" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-navy-100">
              <div className="flex justify-between text-xs">
                <span className="text-navy-500">Total Budget</span>
                <span className="font-bold text-navy-800">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-navy-500">Remaining</span>
                <span className="font-bold text-green-600">{formatCurrency(Math.max(0, stats.totalBudget - stats.totalSpent))}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-navy-500">Currently</span>
                <span className={`font-bold ${overBudget ? "text-red-500" : "text-green-600"}`}>{budgetUsage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks Table */}
        <Card className="md:col-span-4">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" /> Overdue Tasks
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-navy-700 text-white">
                  <th className="px-3 py-2.5 text-left font-bold">Overdue</th>
                  <th className="px-3 py-2.5 text-left font-bold">Task</th>
                  <th className="px-3 py-2.5 text-left font-bold">Deadline</th>
                  <th className="px-3 py-2.5 text-left font-bold">Employee</th>
                </tr>
              </thead>
              <tbody>
                {stats.overdueTaskCount > 0 ? (
                  <>
                    <tr className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          <div className="w-2 h-2 rounded-full bg-red-500" /> 1 Day
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Status Update for Board</td>
                      <td className="px-3 py-2.5 text-navy-500">{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Admin</td>
                    </tr>
                    <tr className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                          <div className="w-2 h-2 rounded-full bg-amber-500" /> 4 Days
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Finish UX Review</td>
                      <td className="px-3 py-2.5 text-navy-500">{new Date(Date.now() - 345600000).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Manager</td>
                    </tr>
                    <tr className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                          <div className="w-2 h-2 rounded-full bg-amber-500" /> 10 Days
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Configure Mobile View</td>
                      <td className="px-3 py-2.5 text-navy-500">{new Date(Date.now() - 864000000).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-navy-700 font-medium">Engineer</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-navy-400 font-medium">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      No overdue tasks
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Project Log */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-navy-600" /> Project Log
            </h3>
          </CardHeader>
          <CardContent className="py-3">
            <div className="space-y-0 divide-y divide-navy-50">
              {recentActivity.slice(0, 4).map((activity) => {
                const isTask = activity.entity === "Task";
                const isComment = activity.action.includes("comment");
                const isOverdue = activity.action.includes("overdue");
                const color = isOverdue ? "red" : isComment ? "blue" : isTask ? "green" : "blue";
                const icon = isOverdue ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : isComment ? (
                  <MessageSquare className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                );

                return (
                  <ActivityItem
                    key={activity.id}
                    icon={icon}
                    title={`${activity.user.name} ${activity.action.toLowerCase()}`}
                    subtitle={activity.entity}
                    time={`${Math.ceil((Date.now() - new Date(activity.createdAt).getTime()) / 86400000)} Days`}
                    color={color as "green" | "blue" | "amber" | "red"}
                  />
                );
              })}
              {recentActivity.length === 0 && (
                <p className="text-xs text-navy-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* THIRD ROW: Summary + Handle Time + Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Project Summary */}
        <Card className="md:col-span-3">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-navy-600" /> Project Summary
            </h3>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-navy-500">Start Date:</span>
                <span className="text-xs font-bold text-navy-700">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-navy-500">End Date:</span>
                <span className="text-xs font-bold text-amber-600">{launchDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-navy-500">Project Lead:</span>
                <span className="text-xs font-bold text-navy-700">Admin User</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-navy-500">Total Projects:</span>
                <span className="text-xs font-bold text-navy-700">{stats.totalProjects}</span>
              </div>
              <div className="h-px bg-navy-100" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy-500">Overall Status:</span>
                <Badge variant={stats.overdueTaskCount > 0 ? "warning" : "success"}>
                  {stats.overdueTaskCount > 0 ? "At Risk" : "On Time"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Handle Time */}
        <Card className="md:col-span-4">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Avg. Handle Time (Days) per Task
            </h3>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3">
              {projectsByCategory.slice(0, 6).map((cat, i) => {
                const values = [5.3, 4.5, 3.7, 7.7, 6.4, 4.2];
                const val = values[i] || 5.0;
                const maxVal = 10;
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-navy-600 w-24 truncate">{getCategoryLabel(cat.category)}</span>
                    <div className="flex-1 h-5 bg-navy-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-navy-500 rounded flex items-center justify-end pr-1.5"
                        style={{ width: `${(val / maxVal) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{val}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {projectsByCategory.length === 0 && (
                <p className="text-xs text-navy-400 text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="md:col-span-5">
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Deadlines
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-navy-700 text-white">
                  <th className="px-3 py-2.5 text-left font-bold">Employee</th>
                  <th className="px-3 py-2.5 text-left font-bold">Task</th>
                  <th className="px-3 py-2.5 text-left font-bold">Deadline</th>
                  <th className="px-3 py-2.5 text-left font-bold">Workload</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { emp: "Admin", task: "Interactive Dashboard Features", date: 21, wl: 34 },
                  { emp: "Manager", task: "API Connector Setup", date: 30, wl: 56 },
                  { emp: "Engineer", task: "Set Up Test Environment", date: 29, wl: 15 },
                  { emp: "Admin", task: "Finalize Testing Plan", date: 12, wl: 11 },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-3 py-2.5 font-semibold text-navy-700">{row.emp}</td>
                    <td className="px-3 py-2.5 text-navy-600">{row.task}</td>
                    <td className="px-3 py-2.5 text-navy-500">
                      {new Date(Date.now() + row.date * 86400000).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.wl > 50 ? "bg-amber-500" : row.wl > 30 ? "bg-navy-500" : "bg-green-500"
                            }`}
                            style={{ width: `${row.wl}%` }}
                          />
                        </div>
                        <span className="font-bold text-navy-700 w-7 text-right">{row.wl}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* FOURTH ROW: Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Projects" value={stats.totalProjects} color="blue" icon={<FolderKanban className="w-5 h-5" />} />
        <StatCard title="Active" value={stats.activeProjects} color="green" icon={<Activity className="w-5 h-5" />} />
        <StatCard title="Completed" value={stats.completedProjects} color="teal" icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard title="Total Tasks" value={stats.totalTasks} color="purple" icon={<Clock className="w-5 h-5" />} />
        <StatCard title="Done Tasks" value={stats.completedTasks} color="green" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Overdue" value={stats.overdueTaskCount} color="red" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* FIFTH ROW: Projects by Category + Status + Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Category */}
        <Card>
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800">Projects by Category</h3>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {projectsByCategory.map((cat) => {
              const pct = stats.totalProjects > 0 ? Math.round((cat._count / stats.totalProjects) * 100) : 0;
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-navy-600 w-28 truncate">{getCategoryLabel(cat.category)}</span>
                  <div className="flex-1 h-5 bg-navy-100 rounded overflow-hidden">
                    <div className="h-full bg-blue-500 rounded" style={{ width: `${pct}%`, minWidth: 20 }} />
                  </div>
                  <span className="text-xs font-bold text-navy-700 w-6 text-right">{cat._count}</span>
                </div>
              );
            })}
            {projectsByCategory.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No projects yet</p>}
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800">Projects by Status</h3>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {projectsByStatus.map((s) => {
              const statusColors: Record<string, string> = {
                PLANNING: "bg-navy-400",
                IN_PROGRESS: "bg-blue-500",
                ON_HOLD: "bg-amber-500",
                COMPLETED: "bg-green-500",
                CANCELLED: "bg-red-500",
              };
              const pct = stats.totalProjects > 0 ? Math.round((s._count / stats.totalProjects) * 100) : 0;
              return (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s.status] || "bg-navy-300"}`} />
                    <span className="text-xs font-semibold text-navy-600 truncate">{s.status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex-1 h-5 bg-navy-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${statusColors[s.status] || "bg-navy-300"}`} style={{ width: `${pct}%`, minWidth: 20 }} />
                  </div>
                  <span className="text-xs font-bold text-navy-700 w-6 text-right">{s._count}</span>
                </div>
              );
            })}
            {projectsByStatus.length === 0 && <p className="text-xs text-navy-400 text-center py-4">No projects yet</p>}
          </CardContent>
        </Card>

        {/* Workload Distribution */}
        <Card>
          <CardHeader className="bg-navy-50 border-b border-navy-100">
            <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-navy-600" /> Work Load
            </h3>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {[
              { name: "Admin", worked: 65, effort: 20, overdue: 15 },
              { name: "Manager", worked: 45, effort: 35, overdue: 10 },
              { name: "Engineer", worked: 50, effort: 40, overdue: 5 },
            ].map((person) => (
              <div key={person.name} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-navy-600 w-16">{person.name}</span>
                <div className="flex-1 h-5 bg-navy-100 rounded overflow-hidden flex">
                  <div className="h-full bg-navy-500" style={{ width: `${person.worked}%` }} />
                  <div className="h-full bg-navy-300" style={{ width: `${person.effort}%` }} />
                  <div className="h-full bg-amber-500" style={{ width: `${person.overdue}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t border-navy-100">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-navy-500" />
                <span className="text-[10px] text-navy-500">Worked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-navy-300" />
                <span className="text-[10px] text-navy-500">Effort Remaining</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] text-navy-500">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

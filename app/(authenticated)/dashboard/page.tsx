"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Progress, Badge, Spinner } from "@/components/ui";
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatCurrency, getCategoryLabel, getStatusColor } from "@/lib/utils";
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
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentActivity, projectsByCategory, projectsByStatus } = data;
  const budgetUsage = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: Activity,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Completed",
      value: stats.completedProjects,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Overdue Tasks",
      value: stats.overdueTaskCount,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
    {
      title: "Total Budget",
      value: formatCurrency(stats.totalBudget),
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Task Completion",
      value: stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">IT Infrastructure Project Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-gray-900 mb-4">Budget Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Spent</span>
                <span className="font-medium">{formatCurrency(stats.totalSpent)}</span>
              </div>
              <Progress value={budgetUsage} showLabel />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalBudget - stats.totalSpent)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects by Category */}
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-gray-900 mb-4">Projects by Category</h3>
            <div className="space-y-3">
              {projectsByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{getCategoryLabel(cat.category)}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max(20, cat._count * 20)}px` }} />
                    <span className="text-sm font-medium">{cat._count}</span>
                  </div>
                </div>
              ))}
              {projectsByCategory.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects by Status */}
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-gray-900 mb-4">Projects by Status</h3>
            <div className="space-y-2">
              {projectsByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <Badge className={getStatusColor(s.status)}>
                    {s.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm font-medium">{s._count}</span>
                </div>
              ))}
              {projectsByStatus.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      {activity.action.toLowerCase()} {activity.entity.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Overview */}
        <Card className="lg:col-span-2">
          <CardContent className="py-5">
            <h3 className="font-semibold text-gray-900 mb-4">Task Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{stats.completedTasks}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <Activity className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{stats.totalTasks - stats.completedTasks}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{stats.overdueTaskCount}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

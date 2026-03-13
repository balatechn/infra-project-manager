"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  Select,
  Spinner,
  EmptyState,
  StatCard,
} from "@/components/ui";
import { FileText, Download, Plus, TrendingUp, Calendar, BarChart3, Eye, X } from "lucide-react";
import { formatDate, formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Report } from "@/types/project-types";

const reportTypeOptions = [
  { value: "", label: "All Types" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "PROJECT_SUMMARY", label: "Project Summary" },
  { value: "BUDGET", label: "Budget" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  const handleGenerate = async (type: string) => {
    setGenerating(true);
    const res = await fetch(`/api/reports?type=${type}`, { method: "POST" });
    if (res.ok) {
      fetchReports();
    }
    setGenerating(false);
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "info" | "success" | "warning" | "danger" | "default"> = {
      WEEKLY: "info",
      MONTHLY: "success",
      PROJECT_SUMMARY: "warning",
      BUDGET: "danger",
      CUSTOM: "default",
    };
    return variants[type] || "default";
  };

  const downloadReport = (report: Report) => {
    const content = JSON.stringify(report.content, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Reports & Analysis</h1>
          <p className="text-sm text-navy-500 mt-0.5">Generate and view project reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleGenerate("WEEKLY")}
            disabled={generating}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Weekly
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerate("MONTHLY")}
            disabled={generating}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Monthly
          </Button>
          <Button
            onClick={() => handleGenerate("PROJECT_SUMMARY")}
            disabled={generating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={reports.length} color="blue" icon={<FileText className="w-5 h-5" />} />
        <StatCard title="Weekly" value={reports.filter(r => r.type === "WEEKLY").length} color="teal" icon={<Calendar className="w-5 h-5" />} />
        <StatCard title="Monthly" value={reports.filter(r => r.type === "MONTHLY").length} color="green" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Summaries" value={reports.filter(r => r.type === "PROJECT_SUMMARY").length} color="purple" icon={<BarChart3 className="w-5 h-5" />} />
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select
          options={reportTypeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Generate your first report to track project progress"
          action={
            <Button onClick={() => handleGenerate("WEEKLY")}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Weekly Report
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Report Table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-700 text-white">
                    <th className="px-4 py-3 text-left font-bold text-xs">Report</th>
                    <th className="px-4 py-3 text-left font-bold text-xs">Type</th>
                    <th className="px-4 py-3 text-left font-bold text-xs">Generated</th>
                    <th className="px-4 py-3 text-right font-bold text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-navy-600" />
                          </div>
                          <span className="font-semibold text-navy-800">{report.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getTypeBadge(report.type)}>{report.type.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-navy-500">{formatDate(report.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-100 rounded-md transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => downloadReport(report)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-100 rounded-md transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Report Detail */}
          {selectedReport && (
            <Card>
              <CardHeader className="bg-navy-50 border-b border-navy-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-navy-800">{selectedReport.title}</h2>
                  <button onClick={() => setSelectedReport(null)} className="w-7 h-7 rounded-md hover:bg-navy-200 flex items-center justify-center transition-colors">
                    <X className="h-4 w-4 text-navy-500" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                {Array.isArray(selectedReport.content) ? (
                  <div className="space-y-3">
                    {(selectedReport.content as Record<string, unknown>[]).map((item, i) => (
                      <div key={i} className="p-4 bg-navy-50/50 rounded-lg border border-navy-100">
                        <h3 className="font-bold text-navy-800 text-sm">
                          {(item.projectName as string) || `Item ${i + 1}`}
                        </h3>
                        {item.client ? (
                          <p className="text-xs text-navy-500 mt-0.5">
                            {item.client as string} &bull; {item.location as string}
                          </p>
                        ) : null}
                        {item.category ? (
                          <p className="text-xs text-navy-400">
                            {getCategoryLabel(item.category as string)}
                          </p>
                        ) : null}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          {item.progress !== undefined && (
                            <div>
                              <p className="text-[10px] font-semibold text-navy-400 uppercase">Progress</p>
                              <p className="text-sm font-bold text-navy-800">{item.progress as number}%</p>
                            </div>
                          )}
                          {item.budget !== undefined && (
                            <div>
                              <p className="text-[10px] font-semibold text-navy-400 uppercase">Budget</p>
                              <p className="text-sm font-bold text-navy-800">{formatCurrency(item.budget as number)}</p>
                            </div>
                          )}
                          {item.spent !== undefined && (
                            <div>
                              <p className="text-[10px] font-semibold text-navy-400 uppercase">Spent</p>
                              <p className="text-sm font-bold text-navy-800">{formatCurrency(item.spent as number)}</p>
                            </div>
                          )}
                          {item.totalTasks !== undefined && (
                            <div>
                              <p className="text-[10px] font-semibold text-navy-400 uppercase">Tasks</p>
                              <p className="text-sm font-bold text-navy-800">
                                {item.doneTasks as number}/{item.totalTasks as number}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-xs bg-navy-50 p-4 rounded-lg overflow-auto text-navy-700 border border-navy-100">
                    {JSON.stringify(selectedReport.content, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

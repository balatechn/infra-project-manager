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
} from "@/components/ui";
import { FileText, Download, Plus, TrendingUp, DollarSign, Calendar } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and view project reports</p>
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

      {/* Filters */}
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
          <Spinner />
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
          {/* Report list */}
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Generated on {formatDate(report.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getTypeBadge(report.type)}>{report.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report detail */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{selectedReport.title}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Array.isArray(selectedReport.content) ? (
                  <div className="space-y-4">
                    {(selectedReport.content as Record<string, unknown>[]).map((item, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900">
                          {(item.projectName as string) || `Item ${i + 1}`}
                        </h3>
                        {item.client ? (
                          <p className="text-sm text-gray-500">
                            {item.client as string} • {item.location as string}
                          </p>
                        ) : null}
                        {item.category ? (
                          <p className="text-sm text-gray-500">
                            {getCategoryLabel(item.category as string)}
                          </p>
                        ) : null}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          {item.progress !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Progress</p>
                              <p className="font-semibold">{item.progress as number}%</p>
                            </div>
                          )}
                          {item.budget !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Budget</p>
                              <p className="font-semibold">{formatCurrency(item.budget as number)}</p>
                            </div>
                          )}
                          {item.spent !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Spent</p>
                              <p className="font-semibold">{formatCurrency(item.spent as number)}</p>
                            </div>
                          )}
                          {item.totalTasks !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Tasks</p>
                              <p className="font-semibold">
                                {item.doneTasks as number}/{item.totalTasks as number}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
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

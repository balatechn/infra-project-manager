"use client"

import { mockRisks } from "@/lib/mock-data"
import { useProjectStore } from "@/store/useProjectStore"
import { Risk } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const impactColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/20",
  mitigated: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Heatmap config
const impacts = ["critical", "high", "medium", "low"] as const
const likelihoods = ["rare", "unlikely", "possible", "likely", "certain"] as const

const heatmapColors: Record<string, string> = {
  "low-rare": "bg-green-500/20",
  "low-unlikely": "bg-green-500/30",
  "low-possible": "bg-yellow-500/20",
  "low-likely": "bg-yellow-500/30",
  "low-certain": "bg-orange-500/20",
  "medium-rare": "bg-green-500/30",
  "medium-unlikely": "bg-yellow-500/20",
  "medium-possible": "bg-yellow-500/40",
  "medium-likely": "bg-orange-500/30",
  "medium-certain": "bg-orange-500/40",
  "high-rare": "bg-yellow-500/20",
  "high-unlikely": "bg-yellow-500/40",
  "high-possible": "bg-orange-500/40",
  "high-likely": "bg-red-500/30",
  "high-certain": "bg-red-500/50",
  "critical-rare": "bg-yellow-500/30",
  "critical-unlikely": "bg-orange-500/30",
  "critical-possible": "bg-red-500/30",
  "critical-likely": "bg-red-500/50",
  "critical-certain": "bg-red-500/70",
}

function RiskHeatmap({ risks }: { risks: Risk[] }) {
  const getRiskCount = (impact: string, likelihood: string) =>
    risks.filter((r) => r.impact === impact && r.likelihood === likelihood)
      .length

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header */}
            <div className="flex">
              <div className="w-20 shrink-0" />
              {likelihoods.map((l) => (
                <div
                  key={l}
                  className="flex-1 text-center text-[10px] font-medium text-muted-foreground capitalize pb-2"
                >
                  {l}
                </div>
              ))}
            </div>

            {/* Rows */}
            {impacts.map((impact) => (
              <div key={impact} className="flex">
                <div className="w-20 shrink-0 flex items-center text-[10px] font-medium text-muted-foreground capitalize">
                  {impact}
                </div>
                {likelihoods.map((likelihood) => {
                  const count = getRiskCount(impact, likelihood)
                  return (
                    <div
                      key={`${impact}-${likelihood}`}
                      className={cn(
                        "flex-1 aspect-square m-0.5 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                        heatmapColors[`${impact}-${likelihood}`]
                      )}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  )
                })}
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>← Impact</span>
              <span>Likelihood →</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RisksPage() {
  const projects = useProjectStore((s) => s.projects)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Risk Management
          </h1>
          <p className="text-muted-foreground">
            Identify, assess, and mitigate project risks
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Risk
        </Button>
      </div>

      {/* Heatmap */}
      <RiskHeatmap risks={mockRisks} />

      {/* Risk Table */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRisks.map((risk) => {
                const project = projects.find((p) => p.id === risk.projectId)
                return (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{risk.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {risk.mitigationPlan}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {project?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          impactColors[risk.impact]
                        )}
                      >
                        {risk.impact}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize text-muted-foreground">
                      {risk.likelihood}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {risk.owner}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          statusColors[risk.status]
                        )}
                      >
                        {risk.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

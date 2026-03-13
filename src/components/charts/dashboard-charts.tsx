"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

// Use simpler colors that work in both modes
const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <Card className={`glass border-border/50 ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Project Progress Chart ─────────────────────────────────────

interface ProjectProgressData {
  name: string
  progress: number
}

export function ProjectProgressChart({
  data,
}: {
  data: ProjectProgressData[]
}) {
  return (
    <ChartCard title="Project Progress">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "Progress"]}
          />
          <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Task Completion Chart ──────────────────────────────────────

interface TaskCompletionData {
  name: string
  value: number
}

export function TaskCompletionChart({
  data,
}: {
  data: TaskCompletionData[]
}) {
  return (
    <ChartCard title="Task Completion">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Resource Utilization Chart ─────────────────────────────────

interface ResourceData {
  name: string
  utilization: number
  capacity: number
}

export function ResourceUtilizationChart({
  data,
}: {
  data: ResourceData[]
}) {
  const chartData = data.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <ChartCard title="Resource Utilization">
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="100%"
          data={chartData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="utilization"
            cornerRadius={4}
            label={{ fill: "var(--foreground)", fontSize: 11, position: "insideStart" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "Utilization"]}
          />
          <Legend
            iconSize={8}
            iconType="circle"
            layout="horizontal"
            verticalAlign="bottom"
            formatter={(value) => (
              <span style={{ fontSize: "11px", color: "var(--foreground)" }}>
                {value}
              </span>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Issue Distribution Chart ───────────────────────────────────

interface IssueDistData {
  name: string
  value: number
}

export function IssueDistributionChart({
  data,
}: {
  data: IssueDistData[]
}) {
  return (
    <ChartCard title="Issue Distribution">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Budget Overview Chart ──────────────────────────────────────

interface BudgetData {
  month: string
  budget: number
  actual: number
}

export function BudgetOverviewChart({ data }: { data: BudgetData[] }) {
  return (
    <ChartCard title="Budget vs Actual Spend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [
              `$${(Number(value) / 1000).toFixed(0)}k`,
            ]}
          />
          <Legend
            iconType="line"
            iconSize={12}
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

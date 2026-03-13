"use client"

import { mockResources } from "@/lib/mock-data"
import { Resource } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const roleLabels: Record<string, string> = {
  "network-engineer": "Network Engineer",
  "cctv-technician": "CCTV Technician",
  "wifi-specialist": "WiFi Specialist",
  "server-admin": "Server Admin",
  "project-manager": "Project Manager",
  "site-engineer": "Site Engineer",
  designer: "Designer",
}

function ResourceCard({ resource }: { resource: Resource }) {
  const utilization = 100 - resource.availability

  return (
    <Card className="glass border-border/50 hover:border-primary/20 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(resource.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{resource.name}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[resource.role] || resource.role}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span
              className={cn(
                "font-medium",
                utilization > 80
                  ? "text-red-500"
                  : utilization > 60
                    ? "text-yellow-500"
                    : "text-green-500"
              )}
            >
              {utilization}%
            </span>
          </div>
          <Progress
            value={utilization}
            className={cn(
              "h-2",
              utilization > 80
                ? "[&>div]:bg-red-500"
                : utilization > 60
                  ? "[&>div]:bg-yellow-500"
                  : ""
            )}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {resource.assignedTasks}/{resource.totalCapacity} tasks
          </span>
          <span>{resource.availability}% available</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
              {skill}
            </Badge>
          ))}
          {resource.skills.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{resource.skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ResourceUtilChart() {
  const data = mockResources.map((r) => ({
    name: r.name.split(" ")[0],
    utilization: 100 - r.availability,
    available: r.availability,
  }))

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Resource Utilization Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value, name) => [
                `${value}%`,
                name === "utilization" ? "Working" : "Available",
              ]}
            />
            <Bar
              dataKey="utilization"
              stackId="a"
              radius={[0, 0, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.utilization > 80
                      ? "#ef4444"
                      : entry.utilization > 60
                        ? "#f59e0b"
                        : "#22c55e"
                  }
                />
              ))}
            </Bar>
            <Bar
              dataKey="available"
              stackId="a"
              fill="#94a3b8"
              opacity={0.2}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function ResourcesPage() {
  const totalEngineers = mockResources.length
  const overloaded = mockResources.filter((r) => r.availability < 30).length
  const avgUtilization = Math.round(
    mockResources.reduce((sum, r) => sum + (100 - r.availability), 0) /
      mockResources.length
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Team workload and availability
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Team Members</p>
            <p className="text-2xl font-bold">{totalEngineers}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Utilization</p>
            <p className="text-2xl font-bold">{avgUtilization}%</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 border-l-2 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overloaded</p>
            <p className="text-2xl font-bold">{overloaded}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <ResourceUtilChart />

      {/* Resource Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  )
}

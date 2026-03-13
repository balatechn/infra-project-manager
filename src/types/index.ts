// ─── Project Types ──────────────────────────────────────────────

export type ProjectType =
  | "networking"
  | "cctv"
  | "wifi"
  | "data-center"
  | "server"
  | "infrastructure"

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled"

export type HealthStatus = "on-track" | "at-risk" | "critical" | "completed"

export interface Project {
  id: string
  name: string
  description: string
  client: string
  projectManager: string
  projectType: ProjectType
  status: ProjectStatus
  health: HealthStatus
  startDate: string
  endDate: string
  progress: number
  budget: number
  spent: number
  priority: Priority
  tags: string[]
  teamMembers: string[]
  createdAt: string
  updatedAt: string
}

// ─── Task Types ────────────────────────────────────────────────

export type TaskStatus =
  | "backlog"
  | "planned"
  | "in-progress"
  | "review"
  | "completed"

export type Priority = "low" | "medium" | "high" | "critical"

export interface Task {
  id: string
  projectId: string
  parentId: string | null
  title: string
  description: string
  assignee: string
  priority: Priority
  status: TaskStatus
  startDate: string
  endDate: string
  progress: number
  type: "milestone" | "task" | "subtask"
  dependencies: string[]
  children?: Task[]
  createdAt: string
  updatedAt: string
}

// ─── Issue Types ───────────────────────────────────────────────

export type Severity = "low" | "medium" | "high" | "critical"
export type IssueStatus = "open" | "in-progress" | "resolved" | "closed"

export interface Issue {
  id: string
  projectId: string
  title: string
  description: string
  severity: Severity
  status: IssueStatus
  assignee: string
  reportedBy: string
  resolutionDate: string | null
  createdAt: string
  updatedAt: string
}

// ─── Risk Types ────────────────────────────────────────────────

export type ImpactLevel = "low" | "medium" | "high" | "critical"
export type Likelihood = "rare" | "unlikely" | "possible" | "likely" | "certain"

export interface Risk {
  id: string
  projectId: string
  title: string
  description: string
  impact: ImpactLevel
  likelihood: Likelihood
  mitigationPlan: string
  owner: string
  status: "open" | "mitigated" | "closed"
  createdAt: string
  updatedAt: string
}

// ─── Resource Types ────────────────────────────────────────────

export type ResourceRole =
  | "network-engineer"
  | "cctv-technician"
  | "wifi-specialist"
  | "server-admin"
  | "project-manager"
  | "site-engineer"
  | "designer"

export interface Resource {
  id: string
  name: string
  email: string
  role: ResourceRole
  avatar: string
  department: string
  assignedTasks: number
  totalCapacity: number
  availability: number
  skills: string[]
}

// ─── Notification Types ────────────────────────────────────────

export type NotificationType = "info" | "warning" | "error" | "success"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  link?: string
}

// ─── Activity Types ────────────────────────────────────────────

export interface Activity {
  id: string
  projectId: string
  user: string
  action: string
  target: string
  timestamp: string
}

// ─── Report Types ──────────────────────────────────────────────

export type ReportType = "weekly" | "monthly" | "project-status"

export interface Report {
  id: string
  title: string
  type: ReportType
  projectId?: string
  generatedAt: string
  generatedBy: string
  period: { start: string; end: string }
}

// ─── Chart Data Types ──────────────────────────────────────────

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface TimeSeriesDataPoint {
  date: string
  [key: string]: string | number
}

// ─── Kanban Types ──────────────────────────────────────────────

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

// ─── Gantt Types ───────────────────────────────────────────────

export type GanttZoom = "day" | "week" | "month"

export interface GanttItem {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies: string[]
  type: "project" | "milestone" | "task"
  isExpanded?: boolean
  children?: GanttItem[]
}

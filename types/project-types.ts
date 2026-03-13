// ─── Project Types ──────────────────────────────────────────

export type ProjectCategory =
  | "NETWORKING"
  | "CCTV"
  | "WIFI"
  | "SERVER_DEPLOYMENT"
  | "ACCESS_CONTROL"
  | "DATA_CENTER"
  | "IT_ASSET_ROLLOUT"
  | "VENDOR_COORDINATION"
  | "OTHER";

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";

export type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  client: string;
  location: string;
  category: ProjectCategory;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  vendors?: ProjectVendor[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  startDate?: string | null;
  order: number;
  projectId: string;
  assigneeId?: string | null;
  createdById: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
  createdBy?: User;
  subTasks?: Task[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  slaScore: number;
  createdAt: string;
  projects?: ProjectVendor[];
}

export interface ProjectVendor {
  id: string;
  projectId: string;
  vendorId: string;
  scope: string;
  value: number;
  status: string;
  vendor?: Vendor;
  project?: Project;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  projectId: string;
}

export interface Report {
  id: string;
  title: string;
  type: "WEEKLY" | "MONTHLY" | "PROJECT_SUMMARY" | "BUDGET" | "CUSTOM";
  content: Record<string, unknown>;
  projectId?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalSpent: number;
  overdueTaskCount: number;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  project?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  userId: string;
  user?: User;
  projectId?: string | null;
  createdAt: string;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    ON_HOLD: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    TODO: "bg-slate-100 text-slate-800",
    IN_REVIEW: "bg-purple-100 text-purple-800",
    DONE: "bg-green-100 text-green-800",
    BLOCKED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };
  return colors[priority] || "bg-gray-100 text-gray-700";
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    NETWORKING: "Networking",
    CCTV: "CCTV",
    WIFI: "Wi-Fi",
    SERVER_DEPLOYMENT: "Server Deployment",
    ACCESS_CONTROL: "Access Control",
    DATA_CENTER: "Data Center",
    IT_ASSET_ROLLOUT: "IT Asset Rollout",
    VENDOR_COORDINATION: "Vendor Coordination",
    OTHER: "Other",
  };
  return labels[category] || category;
}

export function daysUntil(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

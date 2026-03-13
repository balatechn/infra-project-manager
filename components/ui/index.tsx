"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ─── Button ─────────────────────────────────────────────────

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-navy-700 text-white hover:bg-navy-800 shadow-sm focus-visible:ring-navy-500",
        destructive: "bg-accent-red text-white hover:bg-red-700 shadow-sm",
        outline: "border-2 border-navy-300 text-navy-700 bg-white hover:bg-navy-50",
        secondary: "bg-navy-100 text-navy-800 hover:bg-navy-200",
        ghost: "text-navy-600 hover:bg-navy-50",
        link: "text-navy-600 underline-offset-4 hover:underline",
        success: "bg-accent-green text-white hover:bg-green-700 shadow-sm",
        warning: "bg-accent-amber text-white hover:bg-amber-600 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// ─── Input ──────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "flex h-10 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-accent-red font-medium">{error}</p>}
    </div>
  );
}

// ─── Select ─────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, options, id, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "flex h-10 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Textarea ───────────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ className, label, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Card ───────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "dash-card rounded-xl border border-navy-100 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn("px-5 py-4 border-b border-navy-50", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

// ─── Badge ──────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "navy";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-navy-100 text-navy-700",
    success: "bg-green-50 text-accent-green border border-green-200",
    warning: "bg-amber-50 text-accent-amber border border-amber-200",
    danger: "bg-red-50 text-accent-red border border-red-200",
    info: "bg-blue-50 text-accent-blue border border-blue-200",
    purple: "bg-purple-50 text-accent-purple border border-purple-200",
    navy: "bg-navy-700 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// ─── Progress Bar ───────────────────────────────────────────

interface ProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
  height?: string;
}

export function Progress({ value, className, showLabel = false, color, height = "h-2.5" }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const barColor = color || (
    clampedValue >= 100 ? "bg-accent-green" :
    clampedValue >= 70 ? "bg-navy-500" :
    clampedValue >= 40 ? "bg-accent-amber" :
    "bg-accent-red"
  );

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span className="text-navy-500">Progress</span>
          <span className="text-navy-800">{clampedValue}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-navy-100", height)}>
        <div
          className={cn("rounded-full transition-all duration-700 ease-out", height, barColor)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

// ─── Donut/Gauge Chart ──────────────────────────────────────

interface GaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function Gauge({ value, size = 120, strokeWidth = 10, label, color = "#2b5291" }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e8eef6" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-navy-900">{value}%</span>
      </div>
      {label && <span className="text-xs font-semibold text-navy-500 mt-1">{label}</span>}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
}

export function StatCard({ title, value, subtitle, icon, trend, color = "blue" }: StatCardProps) {
  const colorMap = {
    blue: { bg: "bg-navy-50", icon: "bg-navy-600", text: "text-navy-600" },
    green: { bg: "bg-green-50", icon: "bg-accent-green", text: "text-accent-green" },
    amber: { bg: "bg-amber-50", icon: "bg-accent-amber", text: "text-accent-amber" },
    red: { bg: "bg-red-50", icon: "bg-accent-red", text: "text-accent-red" },
    purple: { bg: "bg-purple-50", icon: "bg-accent-purple", text: "text-accent-purple" },
    teal: { bg: "bg-teal-50", icon: "bg-accent-teal", text: "text-accent-teal" },
  };
  const c = colorMap[color];

  return (
    <Card className="overflow-hidden">
      <div className={cn("h-1", c.icon)} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{title}</p>
            <p className="text-2xl font-bold text-navy-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>}
            {trend && (
              <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", trend.value >= 0 ? "text-accent-green" : "text-accent-red")}>
                <span>{trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%</span>
                <span className="text-navy-400 font-normal">{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("p-2.5 rounded-lg text-white", c.icon)}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Phase Tracker ──────────────────────────────────────────

interface Phase {
  name: string;
  status: "completed" | "in-progress" | "pending";
}

export function PhaseTracker({ phases }: { phases: Phase[] }) {
  return (
    <div className="flex items-center gap-2">
      {phases.map((phase, i) => (
        <React.Fragment key={phase.name}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold",
              phase.status === "completed" ? "bg-accent-green text-white" :
              phase.status === "in-progress" ? "bg-accent-amber text-white pulse-soft" :
              "bg-navy-100 text-navy-400"
            )}>
              {phase.status === "completed" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-semibold text-center leading-tight max-w-[70px]",
              phase.status === "completed" ? "text-accent-green" :
              phase.status === "in-progress" ? "text-accent-amber" :
              "text-navy-400"
            )}>
              {phase.name}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div className={cn(
              "h-0.5 w-8 mt-[-18px]",
              phase.status === "completed" ? "bg-accent-green" : "bg-navy-200"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Data Table ─────────────────────────────────────────────

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-700 text-white">
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 text-left text-xs font-bold uppercase tracking-wider", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={i}
              className={cn("border-b border-navy-50 table-row-hover", onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-navy-700", col.className)}>
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto border border-navy-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 bg-navy-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-navy-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-navy-200 text-navy-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full object-cover ring-2 ring-navy-100", sizes[size])} />;
  }

  return (
    <div className={cn("flex items-center justify-center rounded-full bg-navy-600 text-white font-bold ring-2 ring-navy-100", sizes[size])}>
      {initials}
    </div>
  );
}

// ─── Activity Item ──────────────────────────────────────────

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  time: string;
  color?: "green" | "blue" | "amber" | "red";
}

export function ActivityItem({ icon, title, subtitle, time, color = "blue" }: ActivityItemProps) {
  const colors = {
    green: "bg-accent-green", blue: "bg-navy-600", amber: "bg-accent-amber", red: "bg-accent-red"
  };
  return (
    <div className="flex gap-3 py-2.5">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 text-xs", colors[color])}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-navy-500 truncate">{subtitle}</p>}
      </div>
      <span className="text-[10px] font-semibold text-navy-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

// ─── Risk Indicator ─────────────────────────────────────────

interface RiskIndicatorProps {
  level: "low" | "medium" | "high" | "critical";
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
  const config = {
    low: { color: "bg-accent-green", text: "Low", dots: 1 },
    medium: { color: "bg-accent-amber", text: "Medium", dots: 2 },
    high: { color: "bg-accent-orange", text: "High", dots: 3 },
    critical: { color: "bg-accent-red", text: "Critical", dots: 4 },
  };
  const c = config[level];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((d) => (
          <div key={d} className={cn("w-2 h-2 rounded-full", d <= c.dots ? c.color : "bg-navy-200")} />
        ))}
      </div>
      <span className="text-xs font-semibold text-navy-600">{c.text}</span>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-navy-100 p-5 mb-4">
        <svg className="h-10 w-10 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-navy-800">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-navy-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600", className)} />
  );
}

// ─── Section Header ─────────────────────────────────────────

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
      {action}
    </div>
  );
}

// ─── Status Dot ─────────────────────────────────────────────

export function StatusDot({ status }: { status: "green" | "amber" | "red" }) {
  const colors = { green: "bg-accent-green", amber: "bg-accent-amber", red: "bg-accent-red" };
  return <div className={cn("w-3 h-3 rounded-full", colors[status])} />;
}

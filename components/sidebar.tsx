"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  GanttChart,
  BarChart3,
  Truck,
  LogOut,
  Menu,
  X,
  Server,
  ChevronLeft,
  ChevronRight,
  FileStack,
  Settings2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Kanban Board", href: "/kanban", icon: KanbanSquare },
  { name: "Gantt Chart", href: "/gantt", icon: GanttChart },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Vendors", href: "/vendors", icon: Truck },
];

const adminNavigation = [
  { name: "Templates", href: "/admin/templates", icon: FileStack },
  { name: "Masters", href: "/admin/masters", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-navy-900 to-navy-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm">
          <Server className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">InfraManager</h1>
            <p className="text-[10px] text-navy-300 font-medium">IT Project Management</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-navy-400", isCollapsed && "hidden")}>Menu</p>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-white/15 text-white shadow-sm backdrop-blur-sm"
                  : "text-navy-300 hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-accent-amber")} />
              {!isCollapsed && <span>{item.name}</span>}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-amber" />
              )}
            </Link>
          );
        })}

        {/* Admin section */}
        <div className={cn("pt-4 mt-3 border-t border-white/10", isCollapsed && "pt-2 mt-2")}>
          <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-navy-400", isCollapsed && "hidden")}>Admin</p>
          {adminNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                  isActive
                    ? "bg-white/15 text-white shadow-sm backdrop-blur-sm"
                    : "text-navy-300 hover:bg-white/8 hover:text-white"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-accent-amber")} />
                {!isCollapsed && <span>{item.name}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-amber" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4">
        <div className="mx-1 h-px bg-white/10 mb-3" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-400 hover:bg-white/8 hover:text-white transition-all duration-150"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-xl bg-navy-900 p-2.5 text-white shadow-lg lg:hidden"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 shadow-xl",
          isCollapsed ? "lg:w-[68px]" : "lg:w-64"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 border-2 border-navy-600 text-navy-300 hover:text-white hover:bg-navy-700 transition-colors shadow"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
        <NavContent />
      </aside>
    </>
  );
}

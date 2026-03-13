"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  GanttChart,
  AlertTriangle,
  ShieldAlert,
  Users,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/useUIStore"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/kanban", label: "Kanban Board", icon: Columns3 },
  { href: "/gantt", label: "Gantt View", icon: GanttChart },
  { href: "/issues", label: "Issues", icon: AlertTriangle },
  { href: "/risks", label: "Risks", icon: ShieldAlert },
  { href: "/resources", label: "Resources", icon: Users },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Server className="h-4 w-4" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold tracking-tight">
              Infra Manager
            </span>
            <span className="truncate text-[10px] font-medium text-muted-foreground">
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
              />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={<span />}>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-center",
            !sidebarCollapsed && "justify-start"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

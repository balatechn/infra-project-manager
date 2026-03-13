"use client"

import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { useUIStore } from "@/store/useUIStore"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopNav />
        <main
          className={cn(
            "min-h-[calc(100vh-4rem)] transition-all duration-300 p-6",
            sidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}

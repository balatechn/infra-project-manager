"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUIStore } from "@/store/useUIStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TopNav() {
  const { sidebarCollapsed, globalSearch, setGlobalSearch } = useUIStore()
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } =
    useNotificationStore()
  const unreadCount = getUnreadCount()

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, tasks, issues..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto text-xs text-muted-foreground"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 border-b p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                      !n.read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        n.type === "error" && "bg-destructive",
                        n.type === "warning" && "bg-yellow-500",
                        n.type === "success" && "bg-green-500",
                        n.type === "info" && "bg-blue-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">Sarah Chen</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Admin
                </Badge>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

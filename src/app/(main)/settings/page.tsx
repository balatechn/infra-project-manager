"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
} from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </div>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                SC
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Sarah Chen</p>
              <p className="text-sm text-muted-foreground">
                sarah.c@infrapro.com
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">
                Administrator
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Full Name</Label>
              <Input defaultValue="Sarah Chen" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input defaultValue="sarah.c@infrapro.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Input defaultValue="Project Manager" disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Department</Label>
              <Input defaultValue="Project Management" disabled />
            </div>
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Theme</Label>
            <Select value={theme} onValueChange={(v) => { if (v) setTheme(v) }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </div>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Project updates", "Task assignments", "Issue alerts", "Weekly reports"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm">{item}</span>
                <Badge variant="secondary" className="text-xs">
                  Enabled
                </Badge>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* System */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">System</CardTitle>
          </div>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <Badge variant="outline" className="text-xs">v1.0.0</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span>Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>Mar 13, 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

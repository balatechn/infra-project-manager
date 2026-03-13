"use client"

import { Activity } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[360px] pr-4">
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={activity.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  {i < activities.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">
                      {activity.action}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm font-medium truncate">
                    {activity.target}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

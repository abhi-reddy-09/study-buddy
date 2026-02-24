import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Clock, MessageCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/src/lib/api"
import { UserAvatar } from "@/src/components/UserAvatar"

interface OtherUser {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface LastMessage {
  id: string
  content: string
  createdAt: string
  senderId: string
  readAt: string | null
}

interface Conversation {
  otherUser: OtherUser
  lastMessage: LastMessage | null
  unreadCount: number
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/messages/conversations")
      .then((data: Conversation[]) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [])

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="mx-auto mb-20 mt-4 flex min-h-[60vh] max-w-md flex-col items-center justify-center p-4 md:mt-20">
        <MessageCircle className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-800">No conversations yet</h2>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-600">
          You need to match with someone first to message them. Go to Matches to accept or find study buddies.
        </p>
        <Button asChild>
          <Link to="/matches">Go to Matches</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-6 p-4 md:mt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        {totalUnread > 0 && (
          <Badge variant="secondary">{totalUnread} unread</Badge>
        )}
      </div>

      <div className="space-y-3">
        {conversations.map((conv) => {
          const name = `${conv.otherUser.firstName} ${conv.otherUser.lastName}`.trim() || "Unknown"
          const hasUnread = conv.unreadCount > 0
          return (
            <Link key={conv.otherUser.id} to={`/messages/${conv.otherUser.id}`}>
              <Card
                className={cn(
                  "p-4 transition-all hover:bg-gray-50",
                  hasUnread && "border-gray-400 bg-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <UserAvatar
                      profile={{
                        firstName: conv.otherUser.firstName,
                        lastName: conv.otherUser.lastName,
                        avatarUrl: conv.otherUser.avatarUrl,
                      }}
                      className="h-14 w-14"
                    />
                    {hasUnread && (
                      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className={cn("truncate font-semibold", hasUnread && "text-gray-900")}>
                        {name}
                      </h2>
                      {conv.lastMessage && (
                        <div className="flex shrink-0 items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(conv.lastMessage.createdAt)}</span>
                        </div>
                      )}
                    </div>
                    <p
                      className={cn(
                        "truncate text-sm",
                        hasUnread ? "font-medium text-gray-900" : "text-gray-600"
                      )}
                    >
                      {conv.lastMessage?.content ?? "No messages yet"}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

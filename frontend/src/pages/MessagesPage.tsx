import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatPreview {
  id: string
  name: string
  lastMessage: string
  time: string
  image: string
  unread: boolean
}

const chats: ChatPreview[] = [
  {
    id: "1",
    name: "Emma Wilson",
    lastMessage: "How about we study algorithms together?",
    time: "2m ago",
    image: "/placeholder.svg?height=100&width=100",
    unread: true,
  },
  {
    id: "2",
    name: "Alex Chen",
    lastMessage: "Sure, let's meet at the library tomorrow!",
    time: "1h ago",
    image: "/placeholder.svg?height=100&width=100",
    unread: false,
  },
]

export default function MessagesPage() {
  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-6 p-4 md:mt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Badge variant="secondary">
          {chats.filter((chat) => chat.unread).length} unread
        </Badge>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => (
          <Link key={chat.id} to={`/messages/${chat.id}`}>
            <Card
              className={cn("p-4 transition-all hover:bg-gray-50", chat.unread && "border-gray-400 bg-gray-50")}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={chat.image || "/placeholder.svg"}
                    alt={chat.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                  {chat.unread && (
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-gray-800" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className={cn("font-semibold", chat.unread && "text-gray-900")}>{chat.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{chat.time}</span>
                    </div>
                  </div>
                  <p className={cn("text-sm", chat.unread ? "font-medium text-gray-900" : "text-gray-600")}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

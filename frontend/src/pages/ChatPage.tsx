import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, PaperclipIcon, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: string
}

interface Chat {
  id: string
  name: string
  image: string
  messages: ChatMessage[]
}

const chatData: Record<string, Chat> = {
  "1": {
    id: "1",
    name: "Emma Wilson",
    image: "/placeholder.svg?height=100&width=100",
    messages: [
      {
        id: "m1",
        sender: "them",
        content: "Hey there! Would you be interested in forming a study group for the upcoming exams?",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: "m2",
        sender: "me",
        content: "That sounds like a great idea! What subjects were you thinking?",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "m3",
        sender: "them",
        content: "I was thinking we could focus on data structures and algorithms since the final is coming up.",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "m4",
        sender: "them",
        content: "We could meet at the library or use a virtual meeting room.",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "m5",
        sender: "me",
        content: "The library works for me. When were you thinking of meeting?",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "m6",
        sender: "them",
        content: "How about we study algorithms together?",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
    ],
  },
  "2": {
    id: "2",
    name: "Alex Chen",
    image: "/placeholder.svg?height=100&width=100",
    messages: [
      {
        id: "m1",
        sender: "them",
        content: "Hey, are you free to meet and discuss the project tomorrow?",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m2",
        sender: "me",
        content: "Yes, I should be available in the afternoon. What time works for you?",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
      },
      {
        id: "m3",
        sender: "them",
        content: "How about 3pm at the library?",
        timestamp: new Date(Date.now() - 79200000).toISOString(),
      },
      {
        id: "m4",
        sender: "me",
        content: "Sounds good to me!",
        timestamp: new Date(Date.now() - 75600000).toISOString(),
      },
      {
        id: "m5",
        sender: "them",
        content: "Sure, let's meet at the library tomorrow!",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatId && chatData[chatId]) {
        setChat(chatData[chatId])
      } else {
        navigate("/messages")
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [chatId, navigate])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    }
  }

  const groupMessagesByDate = (messages: ChatMessage[] | undefined) => {
    if (!messages) return []
    const groups: Record<string, ChatMessage[]> = {}
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(msg)
    })
    return Object.entries(groups)
      .map(([date, msgs]) => ({
        date,
        timestamp: new Date(date).getTime(),
        messages: msgs,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !chat) return

    const newMessage: ChatMessage = {
      id: `m${chat.messages.length + 1}`,
      sender: "me",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    )
    setMessage("")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800"></div>
      </div>
    )
  }

  if (!chat) return null

  const messageGroups = groupMessagesByDate(chat.messages)

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-3">
            <img
              src={chat.image}
              alt={chat.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h2 className="font-semibold">{chat.name}</h2>
              <p className="text-xs text-gray-600">Online</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date} className="space-y-4">
              <div className="relative flex justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></span>
                <span className="relative bg-gray-50 px-2 text-xs text-gray-600">
                  {formatDateHeader(group.timestamp)}
                </span>
              </div>

              {group.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex max-w-[75%] flex-col gap-1">
                    {msg.sender !== "me" && (
                      <div className="flex items-center gap-2">
                        <img
                          src={chat.image}
                          alt={chat.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="text-xs font-medium">{chat.name}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        msg.sender === "me"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100"
                      )}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white p-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <Button type="button" variant="ghost" size="icon">
            <PaperclipIcon className="h-5 w-5" />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>

          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}

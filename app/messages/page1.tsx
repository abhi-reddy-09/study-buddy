"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, PaperclipIcon, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data - in a real app, this would come from your API
const chatData = {
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
    ]
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
    ]
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const messageEndRef = useRef(null)

  // Fetch chat data
  useEffect(() => {
    // Simulate API call - in a real app, fetch from your backend
    const timer = setTimeout(() => {
      if (chatData[chatId]) {
        setChat(chatData[chatId])
      } else {
        // Handle chat not found
        router.push("/messages")
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [chatId, router])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format date headers
  const formatDateHeader = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    }
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}
    
    messages?.forEach(message => {
      const date = new Date(message.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      timestamp: new Date(date).getTime(),
      messages
    })).sort((a, b) => a.timestamp - b.timestamp)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!message.trim()) return
    
    // Add new message to chat
    const newMessage = {
      id: `m${chat.messages.length + 1}`,
      sender: "me",
      content: message,
      timestamp: new Date().toISOString(),
    }
    
    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))
    
    setMessage("")
    
    // In a real app, you would send this message to your backend
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(chat?.messages)

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="mx-auto flex max-w-4xl items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 items-center gap-3">
            <Image
              src={chat.image}
              alt={chat.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h2 className="font-semibold">{chat.name}</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-accent/10 p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date} className="space-y-4">
              <div className="relative flex justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-border"></span>
                <span className="relative bg-accent/10 px-2 text-xs text-muted-foreground">
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
                        <Image
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
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent"
                      )}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
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

      {/* Message Input */}
      <footer className="border-t bg-background p-4">
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
          
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
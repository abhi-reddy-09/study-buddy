import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Smile, Check, CheckCheck, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/src/lib/api"
import { getSocket, connectSocket } from "@/src/lib/socket"
import { useAuth } from "@/src/contexts/AuthContext"
import { UserAvatar } from "@/src/components/UserAvatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ChatMessage {
  id: string
  sender: "me" | "them"
  content: string
  timestamp: string
  readAt: string | null
}

interface Partner {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

const TYPING_DEBOUNCE_MS = 400
const TYPING_STOP_MS = 2000

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [partner, setPartner] = useState<Partner | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [otherTyping, setOtherTyping] = useState(false)
  const [userIsTypingFlag, setUserIsTypingFlag] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingEmittedRef = useRef(false)

  const currentUserId = user?.id

  // Fetch conversations to resolve partner and ensure we have access; then fetch history
  useEffect(() => {
    if (!chatId || !currentUserId) {
      setLoading(false)
      return
    }

    let cancelled = false

    Promise.all([
      api.get("/messages/conversations") as Promise<Array<{ otherUser: Partner; lastMessage: unknown; unreadCount: number }>>,
      api.get(`/messages/conversations/${chatId}`) as Promise<Array<{ id: string; content: string; senderId: string; receiverId: string; createdAt: string; readAt: string | null }>>,
    ])
      .then(([conversations, history]) => {
        if (cancelled) return
        const conv = conversations.find((c) => c.otherUser.id === chatId)
        if (!conv) {
          navigate("/messages")
          return
        }
        setPartner(conv.otherUser)
        const normalized: ChatMessage[] = history.map((m) => ({
          id: m.id,
          sender: m.senderId === currentUserId ? "me" : "them",
          content: m.content,
          timestamp: m.createdAt,
          readAt: m.readAt,
        }))
        setMessages(normalized)
        // Mark conversation as read: socket notifies sender; REST updates DB if socket not ready
        const sock = getSocket()
        if (sock?.connected) {
          sock.emit("mark_read", { otherUserId: chatId })
        } else {
          api.put(`/messages/conversations/${chatId}/read`).catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) navigate("/messages")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [chatId, currentUserId, navigate])

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Socket: ensure connected, then subscribe to new_message and message_read
  useEffect(() => {
    if (!chatId || !currentUserId) return

    const sock = connectSocket() ?? getSocket()
    if (!sock) return

    const onNewMessage = (payload: {
      id: string
      content: string
      senderId: string
      receiverId: string
      createdAt: string
      readAt: string | null
    }) => {
      if (payload.receiverId !== currentUserId || payload.senderId !== chatId) return
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          sender: "them",
          content: payload.content,
          timestamp: payload.createdAt,
          readAt: payload.readAt,
        },
      ])
    }

    const onMessageRead = () => {
      setMessages((prev) =>
        prev.map((m) => (m.sender === "me" ? { ...m, readAt: new Date().toISOString() } : m))
      )
    }

    sock.on("new_message", onNewMessage)
    sock.on("message_read", onMessageRead)

    return () => {
      sock.off("new_message", onNewMessage)
      sock.off("message_read", onMessageRead)
    }
  }, [chatId, currentUserId])

  // Typing indicators: receive
  useEffect(() => {
    if (!chatId) return
    const sock = getSocket()
    if (!sock) return

    const onTyping = () => setOtherTyping(true)
    const onStop = () => setOtherTyping(false)

    sock.on("user_typing", onTyping)
    sock.on("user_stopped_typing", onStop)

    return () => {
      sock.off("user_typing", onTyping)
      sock.off("user_stopped_typing", onStop)
    }
  }, [chatId])

  // Typing: flag drives when we emit. When flag becomes true (after debounce) emit typing_start; when false emit typing_stop.
  const setTypingFlagTrue = useCallback(() => {
    setUserIsTypingFlag(true)
    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    typingStopRef.current = setTimeout(() => {
      setUserIsTypingFlag(false)
      getSocket()?.emit("typing_stop", { otherUserId: chatId })
      typingStopRef.current = null
      lastTypingEmittedRef.current = false
    }, TYPING_STOP_MS)
  }, [chatId])

  const setTypingFlagFalse = useCallback(() => {
    setUserIsTypingFlag(false)
    if (typingStopRef.current) {
      clearTimeout(typingStopRef.current)
      typingStopRef.current = null
    }
    if (lastTypingEmittedRef.current) {
      getSocket()?.emit("typing_stop", { otherUserId: chatId })
      lastTypingEmittedRef.current = false
    }
  }, [chatId])

  useEffect(() => {
    if (!chatId || !userIsTypingFlag) return
    if (typingDebounceRef.current) return
    typingDebounceRef.current = setTimeout(() => {
      typingDebounceRef.current = null
      lastTypingEmittedRef.current = true
      getSocket()?.emit("typing_start", { otherUserId: chatId })
    }, TYPING_DEBOUNCE_MS)
    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current)
        typingDebounceRef.current = null
      }
    }
  }, [chatId, userIsTypingFlag])

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {}
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(msg)
    })
    return Object.entries(groups)
      .map(([date, m]) => ({ date, timestamp: new Date(date).getTime(), messages: m }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || !chatId || !partner) return

    const sock = getSocket()
    if (!sock) {
      return
    }

    sock.emit("send_message", { receiverId: chatId, content: trimmed })
    setMessage("")
    setTypingFlagFalse()

    sock.once("message_sent", (payload: { id: string; content: string; senderId: string; receiverId: string; createdAt: string; readAt: string | null }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          sender: "me",
          content: payload.content,
          timestamp: payload.createdAt,
          readAt: payload.readAt,
        },
      ])
    })
    sock.once("error", () => {})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setTypingFlagTrue()
  }

  const handleInputBlur = () => {
    setTypingFlagFalse()
  }

  const handleEmojiClick = (data: EmojiClickData) => {
    setMessage((prev) => prev + (data.emoji ?? ""))
  }

  const handleClearChat = useCallback(async () => {
    if (!chatId) return
    setClearing(true)
    try {
      await api.delete(`/messages/conversations/${chatId}`)
      setMessages([])
      setClearChatDialogOpen(false)
    } catch {
      // ignore
    } finally {
      setClearing(false)
    }
  }, [chatId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800" />
      </div>
    )
  }

  if (!partner) return null

  const partnerName = `${partner.firstName} ${partner.lastName}`.trim() || "Unknown"
  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center gap-3">
            <UserAvatar
              profile={{
                firstName: partner.firstName,
                lastName: partner.lastName,
                avatarUrl: partner.avatarUrl,
              }}
              className="h-10 w-10"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold truncate">{partnerName}</h2>
              <p className="text-xs text-gray-600">
                {otherTyping ? "typing…" : "Online"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={(e) => {
                  e.preventDefault()
                  setClearChatDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AlertDialog open={clearChatDialogOpen} onOpenChange={setClearChatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation for both you and {partnerName}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleClearChat()
              }}
              disabled={clearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {clearing ? "Clearing…" : "Clear chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date} className="space-y-4">
              <div className="relative flex justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
                <span className="relative bg-gray-50 px-2 text-xs text-gray-600">
                  {formatDateHeader(group.timestamp)}
                </span>
              </div>
              {group.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}
                >
                  <div className="flex max-w-[75%] flex-col gap-1">
                    {msg.sender !== "me" && (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          profile={{
                            firstName: partner.firstName,
                            lastName: partner.lastName,
                            avatarUrl: partner.avatarUrl,
                          }}
                          className="h-6 w-6"
                        />
                        <span className="text-xs font-medium">{partnerName}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        msg.sender === "me" ? "bg-gray-800 text-white" : "bg-gray-100"
                      )}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span>{formatMessageTime(msg.timestamp)}</span>
                      {msg.sender === "me" && (
                        <span className="ml-1">
                          {msg.readAt ? (
                            <CheckCheck className="h-3.5 w-3.5 text-gray-500" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
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
          <Input
            value={message}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="end" side="top">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" height={360} />
            </PopoverContent>
          </Popover>
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}

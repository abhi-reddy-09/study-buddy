import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, PaperclipIcon, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client"; // Import socket.io-client
import { useAuth } from "@/src/context/AuthContext";
import { fetchUserDetails, fetchUserImage } from "@/src/api/users"; // Import API functions

const API_BASE_URL = "http://localhost:5000"; // Flask backend URL

interface ChatMessage {
  id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

interface ChatPartner {
  id: number;
  username: string;
  image: string;
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Effect for Socket.IO connection and event handling
  useEffect(() => {
    if (!isAuthenticated || authLoading || !currentUser || !chatId) return;

    const newSocket = io(API_BASE_URL); // Connect to your Flask Socket.IO server

    newSocket.on("connect", () => {
      console.log("Socket.IO connected");
      newSocket.emit("join", { userId: currentUser.id }); // Join own room
    });

    newSocket.on("receive_message", (msg: ChatMessage) => {
      console.log("Received message:", msg);
      // Only add messages relevant to the current chat partner
      if (
        (msg.sender_id === currentUser.id && msg.receiver_id === parseInt(chatId)) ||
        (msg.sender_id === parseInt(chatId) && msg.receiver_id === currentUser.id)
      ) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    newSocket.on("status", (data: { msg: string }) => {
      console.log("Socket.IO status:", data.msg);
    });

    newSocket.on("error", (data: { message: string }) => {
      console.error("Socket.IO error:", data.message);
      setError(data.message);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    setSocket(newSocket);

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, authLoading, currentUser, chatId]);

  // Effect to load chat partner details and potentially chat history
  useEffect(() => {
    const loadChatData = async () => {
      if (!chatId || !currentUser) {
        setChatLoading(false);
        return;
      }

      try {
        setChatLoading(true);
        // Fetch chat partner details
        const partnerDetails = await fetchUserDetails(parseInt(chatId));
        const partnerImage = await fetchUserImage(parseInt(chatId));
        setChatPartner({ ...partnerDetails, image: partnerImage });

        // TODO: In a real app, fetch historical messages from a REST API endpoint
        // For now, messages will only come via Socket.IO
        setMessages([]); // Clear previous messages
      } catch (err: any) {
        setError(err.message || "Failed to load chat partner details.");
      } finally {
        setChatLoading(false);
      }
    };

    loadChatData();
  }, [chatId, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    }
  };

  const groupMessagesByDate = (msgs: ChatMessage[] | undefined) => {
    if (!msgs) return [];
    const groups: Record<string, ChatMessage[]> = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return Object.entries(groups)
      .map(([date, msgs]) => ({
        date,
        timestamp: new Date(date).getTime(),
        messages: msgs,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !currentUser || !chatId) return;

    const newMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for client-side
      sender_id: currentUser.id,
      receiver_id: parseInt(chatId),
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add the message to the UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    socket.emit("send_message", {
      receiver_id: parseInt(chatId),
      content: messageInput,
    });

    setMessageInput("");
  };

  if (authLoading || chatLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Please log in to view chats.</p>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chat partner not found.</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-background p-4">
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
              src={chatPartner.image || "/placeholder.svg"}
              alt={chatPartner.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{chatPartner.username}</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </header>

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
                    msg.sender_id === currentUser.id ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex max-w-[75%] flex-col gap-1">
                    {msg.sender_id !== currentUser.id && (
                      <div className="flex items-center gap-2">
                        <img
                          src={chatPartner.image || "/placeholder.svg"}
                          alt={chatPartner.username}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                        <span className="text-xs font-medium">{chatPartner.username}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        msg.sender_id === currentUser.id
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

      <footer className="border-t bg-background p-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <Button type="button" variant="ghost" size="icon">
            <PaperclipIcon className="h-5 w-5" />
          </Button>

          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>

          <Button type="submit" size="icon" disabled={!messageInput.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

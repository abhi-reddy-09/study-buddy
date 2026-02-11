import { Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import DiscoveryPage from "@/src/pages/DiscoveryPage"
import MatchesPage from "@/src/pages/MatchesPage"
import MessagesPage from "@/src/pages/MessagesPage"
import ProfilePage from "@/src/pages/ProfilePage"
import ChatPage from "@/src/pages/ChatPage"

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DiscoveryPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:chatId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

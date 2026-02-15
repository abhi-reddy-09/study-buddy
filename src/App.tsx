import { Routes, Route, useLocation } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import LandingPage from "@/src/pages/LandingPage"
import DiscoveryPage from "@/src/pages/DiscoveryPage"
import MatchesPage from "@/src/pages/MatchesPage"
import MessagesPage from "@/src/pages/MessagesPage"
import ProfilePage from "@/src/pages/ProfilePage"
import ChatPage from "@/src/pages/ChatPage"

export default function App() {
  const location = useLocation()
  const showNavbar = location.pathname !== "/"

  return (
    <div className="flex min-h-screen flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/discovery" element={<DiscoveryPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:chatId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

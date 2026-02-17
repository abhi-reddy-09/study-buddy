import { Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/src/contexts/AuthContext"
import LandingPage from "@/src/pages/LandingPage"
import DiscoveryPage from "@/src/pages/DiscoveryPage"
import MatchesPage from "@/src/pages/MatchesPage"
import MessagesPage from "@/src/pages/MessagesPage"
import ProfilePage from "@/src/pages/ProfilePage"
import ChatPage from "@/src/pages/ChatPage"
import LoginPage from "@/src/pages/LoginPage"
import RegisterPage from "@/src/pages/RegisterPage"

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:chatId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

import { useState } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext"
import { ProtectedRoute } from "@/src/components/ProtectedRoute"
import { Toaster } from "sonner"
import LandingPage from "@/src/pages/LandingPage"
import DiscoveryPage from "@/src/pages/DiscoveryPage"
import MatchesPage from "@/src/pages/MatchesPage"
import MessagesPage from "@/src/pages/MessagesPage"
import ProfilePage from "@/src/pages/ProfilePage"
import ChatPage from "@/src/pages/ChatPage"
import LoginPage from "@/src/pages/LoginPage"
import RegisterPage from "@/src/pages/RegisterPage"

function AppShell() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const isLanding = pathname === "/" && !isAuthenticated

  return (
    <>
      <Navbar isExpanded={sidebarExpanded} onToggle={() => setSidebarExpanded((v) => !v)} />
      <main
        className={`min-h-screen pb-20 md:pb-0 transition-[padding] duration-200 ease-out ${
          isLanding ? "" : sidebarExpanded ? "md:pl-[240px]" : "md:pl-[64px]"
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/discovery" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </div>
  )
}

import { Routes, Route, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import DiscoveryPage from "@/src/pages/DiscoveryPage"
import MatchesPage from "@/src/pages/MatchesPage"
import MessagesPage from "@/src/pages/MessagesPage"
import ProfilePage from "@/src/pages/ProfilePage"
import ChatPage from "@/src/pages/ChatPage"
import LoginPage from "@/src/pages/LoginPage"
import RegisterPage from "@/src/pages/RegisterPage"
import { AuthProvider, useAuth } from "@/src/context/AuthContext"
import { ReactNode, useEffect } from "react"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner/skeleton
  }

  return isAuthenticated ? (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  ) : null;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/messages/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

import { createContext, useCallback, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"

export interface User {
  id: string
  provider: string
  providerId: string
  email: string | null
  name: string | null
  avatar: string | null
  createdAt: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading] = useState(false)
  const navigate = useNavigate()

  const login = useCallback(() => {
    // UI-only: no backend. Log in is a no-op; protected routes show the login prompt.
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    navigate("/")
  }, [navigate])

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

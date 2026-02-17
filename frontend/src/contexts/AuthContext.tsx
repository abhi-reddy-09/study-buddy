import { createContext, useCallback, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"

export interface User {
  id: string
  email: string
  profile?: {
    firstName: string
    lastName: string
    major?: string | null
    bio?: string | null
    studyHabits?: string | null
  } | null
}

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (data: { email: string; password: string }) => Promise<void>
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => void
}

const API_URL = "http://localhost:5000"

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading] = useState(false)
  const navigate = useNavigate()

  const login = useCallback(async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Login failed")
    }
    const result = await res.json()
    setToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Registration failed")
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    navigate("/")
  }, [navigate])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

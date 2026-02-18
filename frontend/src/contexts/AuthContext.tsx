import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/src/lib/api"

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
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On mount: restore auth state from localStorage token
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
      api.get("/auth/me")
        .then((data) => {
          setUser(data.user)
        })
        .catch(() => {
          // Token is invalid/expired — clean up
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (data: { email: string; password: string }) => {
    const result = await api.post("/auth/login", data)
    localStorage.setItem("token", result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    await api.post("/auth/register", data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
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
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

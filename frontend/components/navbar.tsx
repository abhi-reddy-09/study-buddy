import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Compass,
  Users,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { SessionTime } from "@/src/components/SessionTime"

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 64

interface NavbarProps {
  isExpanded?: boolean
  onToggle?: () => void
}

export function Navbar({ isExpanded = false, onToggle }: NavbarProps) {
  const { pathname } = useLocation()
  const { isAuthenticated, logout, user } = useAuth()

  const isLanding = pathname === "/" && !isAuthenticated

  const navItems = [
    { label: "Discover", icon: Compass, href: "/discovery" },
    { label: "Matches", icon: Users, href: "/matches" },
    { label: "Messages", icon: MessageSquare, href: "/messages" },
    { label: "Profile", icon: User, href: "/profile" },
  ]

  const initials = user?.profile
    ? `${user.profile.firstName?.[0] || ""}${user.profile.lastName?.[0] || ""}`.toUpperCase()
    : ""

  const displayName = user?.profile
    ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
    : ""

  // Landing Page Header
  if (isLanding) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white text-sm">
              S
            </span>
            <span>StudyBuddy</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  // Desktop Sidebar — clean redesign
  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-gray-200 bg-gray-50/50 md:flex"
      >
        {/* Header: logo only */}
        <div className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Link
            to={isAuthenticated ? "/discovery" : "/"}
            className={`flex items-center gap-3 ${!isExpanded ? "mx-auto" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
              S
            </span>
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-semibold text-gray-900"
                >
                  StudyBuddy
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {isAuthenticated ? (
              navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                      } ${!isExpanded ? "justify-center px-2" : ""}`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <item.icon size={20} className="shrink-0" strokeWidth={2} />
                      <AnimatePresence mode="wait">
                        {isExpanded && (
                          <motion.span
                            key={item.label}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                )
              })
            ) : (
              <>
                <li>
                  <Link
                    to="/register"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-900 ${
                      !isExpanded ? "justify-center" : ""
                    }`}
                    title={!isExpanded ? "Sign Up" : undefined}
                  >
                    <UserPlus size={20} className="shrink-0" strokeWidth={2} />
                    {isExpanded && <span>Sign Up</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-900 ${
                      !isExpanded ? "justify-center" : ""
                    }`}
                    title={!isExpanded ? "Login" : undefined}
                  >
                    <LogIn size={20} className="shrink-0" strokeWidth={2} />
                    {isExpanded && <span>Login</span>}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Toggle control — separate row at bottom, no overlap */}
        <div className="shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={onToggle}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-700 ${
              !isExpanded ? "justify-center" : ""
            }`}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <>
                <PanelLeftClose size={18} className="shrink-0" strokeWidth={2} />
                <span>Collapse</span>
              </>
            ) : (
              <PanelLeftOpen size={18} className="shrink-0" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* User footer */}
        {isAuthenticated && (
          <div className="shrink-0 border-t border-gray-200 p-2">
            <SessionTime expanded={isExpanded} />
            <Link
              to="/profile"
              className={`flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/80 ${
                !isExpanded ? "justify-center" : ""
              }`}
              title={!isExpanded ? "Profile" : undefined}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
                {initials || "?"}
              </div>
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-0 flex-1"
                  >
                    <div className="truncate text-sm font-medium">{displayName || "Profile"}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
            <button
              onClick={logout}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-gray-500 hover:bg-white/80 hover:text-gray-700 ${
                !isExpanded ? "justify-center" : ""
              }`}
              title={!isExpanded ? "Log out" : undefined}
            >
              <LogOut size={16} className="shrink-0" strokeWidth={2} />
              {isExpanded && <span>Log out</span>}
            </button>
          </div>
        )}
      </motion.aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {isAuthenticated && (
          <div className="flex justify-center border-b border-gray-100 py-1.5">
            <SessionTime expanded={true} />
          </div>
        )}
        <div className="flex justify-around py-2">
          {isAuthenticated ? (
            navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-1 flex-col items-center gap-1 py-2 ${
                    isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              )
            })
          ) : (
            <>
              <Link to="/login" className="flex flex-1 flex-col items-center gap-1 py-2 text-gray-500">
                <LogIn size={22} />
                <span className="text-[11px] font-medium">Login</span>
              </Link>
              <Link to="/register" className="flex flex-1 flex-col items-center gap-1 py-2 text-gray-500">
                <UserPlus size={22} />
                <span className="text-[11px] font-medium">Register</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

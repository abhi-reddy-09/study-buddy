import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Home, Compass, Users, MessageSquare, User } from "lucide-react"
import { MotionNavIndicator } from "./motion-nav-indicator"

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    color: "text-amber-500",
  },
  {
    label: "Discover",
    icon: Compass,
    href: "/discovery",
    color: "text-violet-500",
  },
  {
    label: "Matches",
    icon: Users,
    href: "/matches",
    color: "text-pink-500",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
    color: "text-blue-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
    color: "text-emerald-500",
  },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background/80 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around px-4 py-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            to={route.href}
            className="relative flex flex-col items-center gap-1 transition-colors hover:text-primary"
          >
            {pathname === route.href && <MotionNavIndicator />}
            <route.icon className={cn("h-5 w-5", pathname === route.href ? route.color : "text-muted-foreground")} />
            <span
              className={cn(
                "text-xs font-medium",
                pathname === route.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {route.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 md:top-0 md:bottom-auto">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <Link href="/">
          <Button variant={pathname === "/" ? "default" : "ghost"} size="icon" className="h-12 w-12">
            <Search className="h-5 w-5" />
            <span className="sr-only">Discover</span>
          </Button>
        </Link>
        <Link href="/matches">
          <Button variant={pathname === "/matches" ? "default" : "ghost"} size="icon" className="h-12 w-12">
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Matches</span>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant={pathname === "/profile" ? "default" : "ghost"} size="icon" className="h-12 w-12">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}


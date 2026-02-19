import { useState, useEffect } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { formatSessionTime, isSessionExpiringSoon } from "@/src/lib/auth"
import { Clock } from "lucide-react"

interface SessionTimeProps {
  /** When false (sidebar collapsed), show only icon with tooltip. */
  expanded?: boolean
}

export function SessionTime({ expanded = true }: SessionTimeProps) {
  const { token } = useAuth()
  const [label, setLabel] = useState(() => formatSessionTime(token))
  const expiringSoon = isSessionExpiringSoon(token)

  useEffect(() => {
    if (!token) return
    const update = () => setLabel(formatSessionTime(token))
    update()
    const id = setInterval(update, 60_000) // every minute
    return () => clearInterval(id)
  }, [token])

  if (!token || !label) return null

  const content = (
    <div
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
        expiringSoon ? "bg-amber-50 text-amber-700" : "text-gray-500"
      } ${!expanded ? "justify-center px-2" : ""}`}
      title={`Session: ${label}`}
    >
      <Clock size={14} className="shrink-0" strokeWidth={2} />
      {expanded && <span className="truncate">{label}</span>}
    </div>
  )
  return content
}

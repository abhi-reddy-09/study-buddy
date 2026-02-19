import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, GraduationCap, Check, X, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuth } from "@/src/contexts/AuthContext"
import api from "@/src/lib/api"
import { UserAvatar } from "@/src/components/UserAvatar"

interface MatchProfile {
  id: string
  profile: { firstName: string; lastName: string; major?: string | null; avatarUrl?: string | null; gender?: string | null } | null
}

interface Match {
  id: string
  initiatorId: string
  receiverId: string
  status: string
  createdAt: string
  initiator: MatchProfile
  receiver: MatchProfile
}

type Tab = "incoming" | "sent" | "accepted"

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("incoming")

  useEffect(() => {
    api.get("/matches")
      .then((data) => setMatches(data))
      .catch((err) => toast.error(err.message || "Failed to load matches"))
      .finally(() => setLoading(false))
  }, [])

  const handle = async (matchId: string, action: "accept" | "reject") => {
    setProcessingId(matchId)
    try {
      await api.put(`/matches/${matchId}/${action}`)
      setMatches((prev) => prev.map((m) =>
        m.id === matchId ? { ...m, status: action === "accept" ? "ACCEPTED" : "REJECTED" } : m
      ))
      toast.success(action === "accept" ? "Match accepted!" : "Match rejected")
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setProcessingId(null)
    }
  }

  const getOther = (m: Match) => (m.initiatorId === user?.id ? m.receiver : m.initiator)

  const incoming = matches.filter((m) => m.status === "PENDING" && m.receiverId === user?.id)
  const sent = matches.filter((m) => m.status === "PENDING" && m.initiatorId === user?.id)
  const accepted = matches.filter((m) => m.status === "ACCEPTED")

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "incoming", label: "Incoming", count: incoming.length },
    { key: "sent", label: "Sent", count: sent.length },
    { key: "accepted", label: "Accepted", count: accepted.length },
  ]

  const list = activeTab === "incoming" ? incoming : activeTab === "sent" ? sent : accepted

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-lg font-semibold">Matches</h1>
      <p className="mb-6 text-sm text-gray-600">Manage your study buddy connections</p>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors ${activeTab === t.key
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${activeTab === t.key
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-600"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-600">No {activeTab} matches yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((match, i) => {
            const other = getOther(match)
            const name = other.profile ? `${other.profile.firstName} ${other.profile.lastName}` : "Unknown"
            const date = new Date(match.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50">
                  <UserAvatar
                    profile={other.profile}
                    className="h-10 w-10 shrink-0"
                    fallbackClassName="bg-gray-100 text-sm font-semibold"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-gray-600">
                      {other.profile?.major && <><GraduationCap className="h-3 w-3" /> {other.profile.major} · </>}
                      {date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {activeTab === "incoming" && (
                      <>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 hover:text-red-600"
                          onClick={() => handle(match.id, "reject")} disabled={processingId === match.id}>
                          {processingId === match.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" className="h-8 w-8"
                          onClick={() => handle(match.id, "accept")} disabled={processingId === match.id}>
                          {processingId === match.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                      </>
                    )}
                    {activeTab === "sent" && (
                      <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                    )}
                    {activeTab === "accepted" && (
                      <Link to={`/messages/${other.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1 text-xs">
                          <MessageCircle className="h-3.5 w-3.5" /> Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { Heart, X, GraduationCap, BookOpen, Users, Loader2 } from "lucide-react"
import { MotionCard } from "@/components/motion-card"
import { toast } from "sonner"
import api from "@/src/lib/api"
import { UserAvatar } from "@/src/components/UserAvatar"

interface DiscoveryUser {
  id: string
  profile: {
    firstName: string
    lastName: string
    major?: string | null
    bio?: string | null
    studyHabits?: string | null
    avatarUrl?: string | null
    gender?: string | null
  } | null
}

export default function DiscoveryPage() {
  const [users, setUsers] = useState<DiscoveryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [swipingDirection, setSwipingDirection] = useState<"left" | "right" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api.get("/discovery")
      .then((data) => setUsers(data))
      .catch((err) => toast.error(err.message || "Failed to load profiles"))
      .finally(() => setLoading(false))
  }, [])

  const handleSwipe = async (direction: "left" | "right") => {
    if (actionLoading || users.length === 0) return
    const current = users[0]
    setSwipingDirection(direction)

    if (direction === "right") {
      setActionLoading(true)
      try {
        await api.post("/matches", { receiverId: current.id })
        toast.success(`Request sent to ${current.profile?.firstName || "user"}!`)
      } catch (err: any) {
        toast.error(err.message || "Failed to send request")
      } finally {
        setActionLoading(false)
      }
    } else {
      // Swipe left: record pass so this user won't show again after refresh
      api.post("/discovery/pass", { passedUserId: current.id }).catch(() => {})
    }

    // Wait for the swipe-out animation to complete before removing the card
    setTimeout(() => {
      setUsers((prev) => prev.slice(1))
      setSwipingDirection(null)
    }, 400)
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="max-w-xs text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="mb-1 text-base font-medium">All caught up</h2>
          <p className="text-sm text-gray-600">No more profiles to show right now. Check back later.</p>
        </div>
      </div>
    )
  }

  const u = users[0]
  const first = u.profile?.firstName || "?"
  const last = u.profile?.lastName || ""
  const name = u.profile ? `${first} ${last}` : "Unknown"

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      {/* Counter */}
      <p className="mb-4 text-sm text-gray-600">
        {users.length} {users.length === 1 ? "profile" : "profiles"} remaining
      </p>

      {/* Card */}
      <div className="w-full max-w-sm">
        <MotionCard id={u.id} swipingDirection={swipingDirection}>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Header */}
            <div className="flex flex-col items-center border-b border-gray-200 px-6 py-8">
              <UserAvatar
                profile={u.profile}
                className="mb-3 h-16 w-16"
                fallbackClassName="bg-gray-100 text-lg font-semibold"
              />
              <h2 className="text-base font-medium">{name}</h2>
              {u.profile?.major && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                  <GraduationCap className="h-3.5 w-3.5" /> {u.profile.major}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
              {u.profile?.bio && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase text-gray-600">About</p>
                  <p className="text-sm leading-relaxed">{u.profile.bio}</p>
                </div>
              )}
              {u.profile?.studyHabits && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase text-gray-600">Study habits</p>
                  <div className="flex items-start gap-2 rounded-lg bg-gray-100 p-3">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
                    <p className="text-sm leading-relaxed">{u.profile.studyHabits}</p>
                  </div>
                </div>
              )}
              {!u.profile?.bio && !u.profile?.studyHabits && (
                <p className="py-3 text-center text-sm italic text-gray-600">No profile details yet.</p>
              )}
            </div>
          </div>
        </MotionCard>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-5">
        <button
          onClick={() => handleSwipe("left")}
          disabled={actionLoading}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          disabled={actionLoading}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-6 w-6" />}
        </button>
      </div>
    </div>
  )
}

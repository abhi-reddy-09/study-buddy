import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, BookOpen, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/src/contexts/AuthContext"
import api from "@/src/lib/api"

const MAJOR_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Business Administration",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Biology",
  "Psychology",
  "Other",
]

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [major, setMajor] = useState("")
  const [bio, setBio] = useState("")
  const [studyHabitsList, setStudyHabitsList] = useState<string[]>([])
  const [studyHabitInput, setStudyHabitInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setFirstName(user.profile.firstName || "")
      setLastName(user.profile.lastName || "")
      setMajor(user.profile.major || "")
      setBio(user.profile.bio || "")
      const raw = user.profile.studyHabits || ""
      setStudyHabitsList(raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [])
    }
  }, [user])

  const addStudyHabit = (value: string) => {
    const next = value.trim()
    if (!next) return
    if (studyHabitsList.some((h) => h.toLowerCase() === next.toLowerCase())) return
    setStudyHabitsList((prev) => [...prev, next])
    setStudyHabitInput("")
  }

  const removeStudyHabit = (habit: string) => {
    setStudyHabitsList((prev) => prev.filter((h) => h !== habit))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const mergedHabits = [...studyHabitsList]
      if (studyHabitInput.trim()) mergedHabits.push(studyHabitInput.trim())
      const studyHabitsStr = mergedHabits.length ? mergedHabits.join(", ") : ""
      const updated = await api.put("/profile", { major: major || undefined, bio, studyHabits: studyHabitsStr || undefined })
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile!,
            major: updated.major ?? undefined,
            bio: updated.bio ?? undefined,
            studyHabits: updated.studyHabits ?? undefined,
          },
        })
      }
      toast.success("Profile updated!")
      setIsEditing(false)
      setStudyHabitInput("")
    } catch (err: any) {
      toast.error(err.message || "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setStudyHabitInput("")
    if (user?.profile) {
      setMajor(user.profile.major || "")
      setBio(user.profile.bio || "")
      const raw = user.profile.studyHabits || ""
      setStudyHabitsList(raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [])
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
      </div>
    )
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-base font-medium">{firstName} {lastName}</h1>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>Cancel</Button>
            <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={firstName} disabled />
          <Field label="Last name" value={lastName} disabled />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase text-gray-600">
            <GraduationCap className="h-3 w-3" /> Major
          </label>
          {isEditing ? (
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
            >
              <option value="">Select your major</option>
              {MAJOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input value={major || "—"} disabled className="disabled:opacity-70" />
          )}
        </div>

        <div>
          <label className="mb-1.5 text-xs font-medium uppercase text-gray-600">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={!isEditing} rows={3} placeholder="Tell others about yourself…" />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase text-gray-600">
            <BookOpen className="h-3 w-3" /> Study habits
          </label>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={studyHabitInput}
                onChange={(e) => setStudyHabitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.preventDefault()
                    addStudyHabit(studyHabitInput)
                  } else if (e.key === "Backspace" && !studyHabitInput && studyHabitsList.length) {
                    e.preventDefault()
                    setStudyHabitsList((prev) => prev.slice(0, -1))
                  }
                }}
                placeholder="Type a habit and press Space"
                className="mb-2"
              />
              {studyHabitsList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {studyHabitsList.map((habit) => (
                    <Badge key={habit} variant="secondary" className="gap-1 pr-1">
                      {habit}
                      <button
                        type="button"
                        className="rounded p-0.5 hover:bg-gray-200"
                        onClick={() => removeStudyHabit(habit)}
                        aria-label={`Remove ${habit}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Input
              value={studyHabitsList.length ? studyHabitsList.join(", ") : "—"}
              disabled
              className="disabled:opacity-70"
            />
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="mb-1 text-sm font-medium text-red-700">Sign out</p>
        <p className="mb-3 text-sm text-gray-600">Log out of your StudyBuddy account on this device.</p>
        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value, disabled }: { label: string; value: string; disabled: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase text-gray-600">{label}</label>
      <Input value={value} disabled={disabled} className="disabled:opacity-70" />
    </div>
  )
}

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, BookOpen, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/src/contexts/AuthContext"
import api from "@/src/lib/api"
import { UserAvatar } from "@/src/components/UserAvatar"
import { buildDiceBearAvatarUrl, getDefaultAvatarStyleForGender, type DiceBearStyle, type ProfileGender } from "@/src/lib/avatar"

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

const AVATAR_STYLES: DiceBearStyle[] = ["initials", "adventurer", "bottts", "avataaars"]
const GENDER_LABELS: Record<ProfileGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  NON_BINARY: "Non-binary",
  PREFER_NOT_TO_SAY: "Prefer not to say",
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [major, setMajor] = useState("")
  const [bio, setBio] = useState("")
  const [studyHabitsList, setStudyHabitsList] = useState<string[]>([])
  const [studyHabitInput, setStudyHabitInput] = useState("")
  const [avatarStyle, setAvatarStyle] = useState<DiceBearStyle>("initials")
  const [avatarSeed, setAvatarSeed] = useState("")
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")
  const [avatarSaving, setAvatarSaving] = useState(false)
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
      const defaultSeed = `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim() || user.email
      const defaultStyle = getDefaultAvatarStyleForGender(user.profile.gender || undefined)
      const currentSeed = defaultSeed
      setAvatarSeed(currentSeed)
      setAvatarStyle(defaultStyle)
      setAvatarPreviewUrl(user.profile.avatarUrl || buildDiceBearAvatarUrl(defaultStyle, currentSeed))
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
            avatarUrl: user.profile?.avatarUrl ?? null,
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

  const handleSaveAvatar = async () => {
    const seed = avatarSeed.trim() || `${firstName} ${lastName}`.trim() || user.email
    const nextAvatarUrl = buildDiceBearAvatarUrl(avatarStyle, seed)
    setAvatarSaving(true)
    try {
      const updated = await api.put("/profile", { avatarUrl: nextAvatarUrl })
      setAvatarPreviewUrl(updated.avatarUrl ?? nextAvatarUrl)
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile!,
            avatarUrl: updated.avatarUrl ?? nextAvatarUrl,
          },
        })
      }
      toast.success("Avatar updated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update avatar")
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleRegenerateAvatar = () => {
    const randomSeed = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    setAvatarSeed(randomSeed)
    setAvatarPreviewUrl(buildDiceBearAvatarUrl(avatarStyle, randomSeed))
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <UserAvatar
          profile={user.profile}
          className="h-14 w-14 shrink-0"
          fallbackClassName="bg-gray-100 text-lg font-semibold"
        />
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
        <Field label="Gender" value={(user.profile?.gender && GENDER_LABELS[user.profile.gender]) || "Prefer not to say"} disabled />

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

      <div className="mt-5 space-y-3 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-medium">Avatar</h2>
        <div className="flex items-center gap-3">
          <UserAvatar
            profile={{
              firstName,
              lastName,
              avatarUrl: avatarPreviewUrl || user.profile?.avatarUrl,
            }}
            className="h-14 w-14"
            fallbackClassName="bg-gray-100 text-lg font-semibold"
          />
          <p className="text-xs text-gray-600">Generated with DiceBear</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-gray-600">Style</label>
            <select
              value={avatarStyle}
              onChange={(e) => {
                const style = e.target.value as DiceBearStyle
                setAvatarStyle(style)
                const seed = avatarSeed.trim() || `${firstName} ${lastName}`.trim() || user.email
                setAvatarPreviewUrl(buildDiceBearAvatarUrl(style, seed))
              }}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
            >
              {AVATAR_STYLES.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-gray-600">Seed</label>
            <Input
              value={avatarSeed}
              onChange={(e) => {
                const seed = e.target.value
                setAvatarSeed(seed)
                const fallbackSeed = seed.trim() || `${firstName} ${lastName}`.trim() || user.email
                setAvatarPreviewUrl(buildDiceBearAvatarUrl(avatarStyle, fallbackSeed))
              }}
              placeholder="Enter avatar seed"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handleRegenerateAvatar} disabled={avatarSaving}>
            Regenerate
          </Button>
          <Button type="button" size="sm" onClick={handleSaveAvatar} disabled={avatarSaving}>
            {avatarSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save avatar
          </Button>
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

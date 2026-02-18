import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, GraduationCap, BookOpen, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/src/contexts/AuthContext"
import api from "@/src/lib/api"

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [major, setMajor] = useState("")
  const [bio, setBio] = useState("")
  const [studyHabits, setStudyHabits] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setFirstName(user.profile.firstName || "")
      setLastName(user.profile.lastName || "")
      setMajor(user.profile.major || "")
      setBio(user.profile.bio || "")
      setStudyHabits(user.profile.studyHabits || "")
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.put("/profile", { major, bio, studyHabits })
      if (user) {
        setUser({
          ...user,
          profile: { ...user.profile!, major: updated.major, bio: updated.bio, studyHabits: updated.studyHabits },
        })
      }
      toast.success("Profile updated!")
      setIsEditing(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user?.profile) {
      setMajor(user.profile.major || "")
      setBio(user.profile.bio || "")
      setStudyHabits(user.profile.studyHabits || "")
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
          <Input value={major} onChange={(e) => setMajor(e.target.value)} disabled={!isEditing} placeholder="e.g. Computer Science" />
        </div>

        <div>
          <label className="mb-1.5 text-xs font-medium uppercase text-gray-600">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={!isEditing} rows={3} placeholder="Tell others about yourself…" />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase text-gray-600">
            <BookOpen className="h-3 w-3" /> Study habits
          </label>
          <Textarea value={studyHabits} onChange={(e) => setStudyHabits(e.target.value)} disabled={!isEditing} rows={3} placeholder="How do you prefer to study?" />
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

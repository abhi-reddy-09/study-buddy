"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, Plus, X } from "lucide-react"
import Image from "next/image"

interface UserProfile {
  name: string
  age: number
  university: string
  course: string
  bio: string
  interests: string[]
  image: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    age: 21,
    university: "Harvard University",
    course: "Computer Science",
    bio: "Passionate about technology and always eager to learn new things. Looking for study partners in AI and web development.",
    interests: ["Programming", "Machine Learning", "Web Development"],
    image: "/placeholder.svg?height=200&width=200",
  })

  const [newInterest, setNewInterest] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const addInterest = () => {
    if (newInterest && !profile.interests.includes(newInterest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest],
      })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    })
  }

  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-4 p-4 md:mt-20">
      <Card className="p-6">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4 h-32 w-32">
            <Image
              src={profile.image || "/placeholder.svg"}
              alt={profile.name}
              width={128}
              height={128}
              className="rounded-full"
            />
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change profile picture</span>
            </Button>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="mb-4">
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">University</label>
              <Input
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Course</label>
            <Input
              value={profile.course}
              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Interests</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                  {isEditing && (
                    <button onClick={() => removeInterest(interest)} className="ml-1 rounded-full hover:bg-muted">
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {interest}</span>
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add new interest"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addInterest()
                    }
                  }}
                />
                <Button onClick={addInterest} size="icon">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add interest</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}


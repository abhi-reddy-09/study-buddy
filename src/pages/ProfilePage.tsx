import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X } from "lucide-react";
import { fetchCurrentUserProfile, fetchUserImage } from "@/src/api/users";
import { useAuth } from "@/src/context/AuthContext";

interface UserProfile {
  id: number;
  username: string;
  age?: number;
  university?: string;
  course?: string;
  bio?: string;
  interests?: string[];
  image?: string;
}

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newInterest, setNewInterest] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser && currentUser.id) {
        try {
          setLoading(true);
          const fetchedProfile = await fetchCurrentUserProfile();
          const imageUrl = await fetchUserImage(currentUser.id);

          setProfile({
            ...fetchedProfile,
            id: currentUser.id,
            username: fetchedProfile.username,
            image: imageUrl,
            // Assuming the backend returns other profile fields, if not, they'll be undefined
            // For now, using placeholders for fields not in initial Flask backend
            age: fetchedProfile.age || 21,
            university: fetchedProfile.university || "Sathyabama University",
            course: fetchedProfile.course || "Computer Science",
            bio: fetchedProfile.bio || "Passionate about technology and always eager to learn new things. Looking for study partners in AI and web development.",
            interests: fetchedProfile.interests || ["Programming", "Machine Learning", "Web Development"],
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No current user, so not loading profile
      }
    };

    loadProfile();
  }, [currentUser]);

  const addInterest = () => {
    if (newInterest && profile && profile.interests && !profile.interests.includes(newInterest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    if (profile && profile.interests) {
      setProfile({
        ...profile,
        interests: profile.interests.filter((i) => i !== interest),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p>No profile data available. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-4 p-4 md:mt-20">
      <Card className="p-6">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4 h-32 w-32">
            <img
              src={profile.image || "/placeholder.svg"}
              alt={profile.username}
              width={128}
              height={128}
              className="rounded-full object-cover h-full w-full"
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
            <label className="text-sm font-medium">Username</label>
            <Input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              disabled={true} // Username is typically not editable
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">University</label>
              <Input
                value={profile.university || ''}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Course</label>
            <Input
              value={profile.course || ''}
              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Interests</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests && profile.interests.map((interest) => (
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
                      e.preventDefault();
                      addInterest();
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
  );
}

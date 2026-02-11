import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Sparkles, GraduationCap, MapPin, Star } from "lucide-react";
import { MotionCard } from "@/components/motion-card";
import { fetchDiscoveryUsers, fetchUserImage } from "@/src/api/users"; // Import API functions

interface StudyProfile {
  id: string;
  name: string;
  age: number;
  university: string;
  course: string;
  interests: string[];
  bio: string;
  image: string; // Add image field
}

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<StudyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipingDirection, setSwipingDirection] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchDiscoveryUsers(); // Fetch users from backend (dummy data for now)
        const profilesWithImages: StudyProfile[] = await Promise.all(
          fetchedUsers.map(async (user: any) => {
            const imageUrl = await fetchUserImage(user.id);
            // Assuming the backend returns 'name', 'age', 'university', 'course', 'interests', 'bio' for discovery users
            // For now, let's use some placeholder data for these fields
            return {
              id: user.id.toString(),
              name: user.username, // Using username as name for now
              age: Math.floor(Math.random() * 5) + 19, // Random age for demo
              university: "Sathyabama University", // Placeholder
              course: "Computer Science", // Placeholder
              interests: ["AI", "Web Dev", "Data Science"], // Placeholder
              bio: user.bio || "Enthusiastic learner seeking study partners!",
              image: imageUrl,
            };
          })
        );
        setProfiles(profilesWithImages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    setSwipingDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipingDirection(null);
    }, 200); // Animation duration
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p>Loading profiles...</p>
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

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="glass-effect animate-bounce-in p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Star className="h-12 w-12 text-primary animate-pulse" />
              <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-accent" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            No More Profiles
          </h2>
          <p className="text-muted-foreground">Check back later for more potential study buddies!</p>
        </Card>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-4 p-4 md:mt-20">
      <MotionCard id={currentProfile.id} swipingDirection={swipingDirection}>
        <Card className="profile-card overflow-hidden">
          <div className="relative">
            <img
              src={currentProfile.image || "/placeholder.svg"}
              alt={currentProfile.name}
              width={300}
              height={400}
              className="h-[500px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="mb-1 text-3xl font-bold">
                {currentProfile.name}, {currentProfile.age}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <GraduationCap className="h-4 w-4 text-secondary" />
                <span className="text-sm">{currentProfile.university}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-sm">{currentProfile.course}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{currentProfile.bio}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gradient-badge rounded-full px-3 py-1">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </MotionCard>

      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-6 p-4 md:bottom-8">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-destructive bg-background/80 backdrop-blur-sm"
          onClick={() => handleSwipe("left")}
        >
          <X className="h-8 w-8 text-destructive" />
          <span className="sr-only">Pass</span>
        </Button>
        <Button size="lg" className="gradient-button h-16 w-16 rounded-full" onClick={() => handleSwipe("right")}>
          <Heart className="h-8 w-8" />
          <span className="sr-only">Like</span>
        </Button>
      </div>
    </div>
  );
}

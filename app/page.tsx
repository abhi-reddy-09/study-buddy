"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, X, Sparkles, GraduationCap, MapPin, Star } from "lucide-react"
import Image from "next/image"
import { MotionCard } from "@/components/motion-card"

interface StudyProfile {
  id: string
  name: string
  age: number
  university: string
  course: string
  interests: string[]
  bio: string
  image: string
}

const profiles: StudyProfile[] = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 21,
    university: "Sathyabama University",
    course: "Biotechnology",
    interests: ["Genetics", "Bioinformatics", "Healthcare Tech"],
    bio: "Aspiring geneticist exploring the intersection of biology and technology. Let's research together!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "2",
    name: "Arjun Das",
    age: 22,
    university: "Sathyabama University",
    course: "Electronics Engineering",
    interests: ["IoT", "Embedded Systems", "Signal Processing"],
    bio: "Love working on IoT projects and hardware innovations. Always eager to learn and share knowledge!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "3",
    name: "Kavya Reddy",
    age: 20,
    university: "Sathyabama University",
    course: "Computer Science",
    interests: ["AI/ML", "Web Development", "Cloud Computing"],
    bio: "Passionate about building intelligent systems and web applications. Looking for coding partners!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "4",
    name: "Rahul Kumar",
    age: 19,
    university: "Sathyabama University",
    course: "Mechanical Engineering",
    interests: ["CAD Design", "3D Printing", "Automation"],
    bio: "Mechanical engineering enthusiast with a love for design and automation. Let's build something cool!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "5",
    name: "Ananya Singh",
    age: 21,
    university: "Sathyabama University",
    course: "Data Science",
    interests: ["Big Data", "Python", "Data Visualization"],
    bio: "Data science student looking to collaborate on interesting data analysis projects.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "6",
    name: "Vikram Patel",
    age: 22,
    university: "Sathyabama University",
    course: "Civil Engineering",
    interests: ["Structural Design", "AutoCAD", "Green Building"],
    bio: "Future civil engineer passionate about sustainable construction. Let's design the future!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "7",
    name: "Shreya Gupta",
    age: 20,
    university: "Sathyabama University",
    course: "Information Technology",
    interests: ["Cybersecurity", "Network Design", "Cloud"],
    bio: "IT enthusiast focusing on cybersecurity and cloud technologies. Always up for tech discussions!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "8",
    name: "Arun Verma",
    age: 21,
    university: "Sathyabama University",
    course: "Artificial Intelligence",
    interests: ["Deep Learning", "Computer Vision", "NLP"],
    bio: "AI researcher working on computer vision projects. Looking for study partners in ML!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "9",
    name: "Neha Kapoor",
    age: 19,
    university: "Sathyabama University",
    course: "Chemical Engineering",
    interests: ["Process Design", "Green Chemistry", "Research"],
    bio: "Chemical engineering student interested in sustainable processes. Let's make chemistry greener!",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "10",
    name: "Karthik Rajan",
    age: 22,
    university: "Sathyabama University",
    course: "Aerospace Engineering",
    interests: ["Aerodynamics", "CAD", "Propulsion Systems"],
    bio: "Aerospace enthusiast dreaming of revolutionizing flight. Looking for study partners in aerodynamics!",
    image: "/placeholder.svg?height=400&width=300",
  },
]

export default function DiscoveryPage() {
  const [currentProfiles, setCurrentProfiles] = useState(profiles)
  const [swipingDirection, setSwipingDirection] = useState<"left" | "right" | null>(null)

  const handleSwipe = (direction: "left" | "right") => {
    setSwipingDirection(direction)
    setTimeout(() => {
      setCurrentProfiles((prev) => prev.slice(1))
      setSwipingDirection(null)
    }, 200)
  }

  if (currentProfiles.length === 0) {
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
    )
  }

  const currentProfile = currentProfiles[0]

  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-4 p-4 md:mt-20">
      <MotionCard id={currentProfile.id} swipingDirection={swipingDirection}>
        <Card className="profile-card overflow-hidden">
          <div className="relative">
            <Image
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
  )
}


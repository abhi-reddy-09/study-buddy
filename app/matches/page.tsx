"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, GraduationCap, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface Match {
  id: string
  name: string
  course: string
  matchDate: string
  image: string
  interests: string[]
  matchPercentage: number
}

const matches: Match[] = [
  {
    id: "1",
    name: "Priya Sharma",
    course: "Biotechnology",
    matchDate: "Matched 2 days ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Genetics", "Bioinformatics", "Healthcare"],
    matchPercentage: 95,
  },
  {
    id: "2",
    name: "Arjun Das",
    course: "Electronics Engineering",
    matchDate: "Matched 3 days ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["IoT", "Embedded Systems", "Robotics"],
    matchPercentage: 92,
  },
  {
    id: "3",
    name: "Kavya Reddy",
    course: "Computer Science",
    matchDate: "Matched 4 days ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["AI/ML", "Web Development", "Cloud Computing"],
    matchPercentage: 89,
  },
  {
    id: "4",
    name: "Rahul Kumar",
    course: "Mechanical Engineering",
    matchDate: "Matched 5 days ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["CAD Design", "3D Printing", "Automation"],
    matchPercentage: 88,
  },
  {
    id: "5",
    name: "Ananya Singh",
    course: "Data Science",
    matchDate: "Matched 6 days ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Big Data", "Python", "Data Visualization"],
    matchPercentage: 87,
  },
  {
    id: "6",
    name: "Vikram Patel",
    course: "Civil Engineering",
    matchDate: "Matched 1 week ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Structural Design", "AutoCAD", "Green Building"],
    matchPercentage: 85,
  },
  {
    id: "7",
    name: "Shreya Gupta",
    course: "Information Technology",
    matchDate: "Matched 1 week ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Cybersecurity", "Network Design", "Cloud"],
    matchPercentage: 84,
  },
  {
    id: "8",
    name: "Arun Verma",
    course: "Artificial Intelligence",
    matchDate: "Matched 1 week ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Deep Learning", "Computer Vision", "NLP"],
    matchPercentage: 83,
  },
  {
    id: "9",
    name: "Neha Kapoor",
    course: "Chemical Engineering",
    matchDate: "Matched 2 weeks ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Process Design", "Green Chemistry", "Research"],
    matchPercentage: 82,
  },
  {
    id: "10",
    name: "Karthik Rajan",
    course: "Aerospace Engineering",
    matchDate: "Matched 2 weeks ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Aerodynamics", "CAD", "Propulsion Systems"],
    matchPercentage: 81,
  },
  {
    id: "11",
    name: "Divya Krishnan",
    course: "Marine Engineering",
    matchDate: "Matched 2 weeks ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Ship Design", "Naval Architecture", "Marine Systems"],
    matchPercentage: 80,
  },
  {
    id: "12",
    name: "Rohan Mehta",
    course: "Software Engineering",
    matchDate: "Matched 2 weeks ago",
    image: "/placeholder.svg?height=100&width=100",
    interests: ["Full Stack", "DevOps", "Mobile Development"],
    matchPercentage: 79,
  },
]

export default function MatchesPage() {
  return (
    <div className="mx-auto mb-20 mt-4 max-w-md space-y-6 p-4 md:mt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Your Matches
        </h1>
        <Badge variant="secondary" className="gradient-badge rounded-full px-3">
          {matches.length} matches
        </Badge>
      </div>

      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden p-4 transition-all hover:bg-accent/5 card-hover">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="relative">
                    <Image
                      src={match.image || "/placeholder.svg"}
                      alt={match.name}
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                    />
                    <div className="absolute -right-1 -top-1 flex items-center justify-center h-6 w-6 rounded-full gradient-button">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 px-2 rounded-full gradient-button flex items-center justify-center text-xs text-white font-medium">
                    {match.matchPercentage}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{match.name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 text-secondary" />
                        <span className="text-sm">{match.course}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{match.matchDate}</span>
                      </div>
                    </div>
                    <Link href={`/messages/${match.id}`}>
                      <Button size="sm" className="gradient-button transition-transform group-hover:scale-105">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="gradient-badge rounded-full px-2 py-0 text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


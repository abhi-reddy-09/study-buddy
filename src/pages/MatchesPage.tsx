import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchMatchedUsers, fetchUserImage } from "@/src/api/users"; // Import API functions

interface Match {
  id: string;
  name: string;
  course: string;
  matchDate: string; // This would come from backend or be generated
  image: string;
  interests: string[];
  matchPercentage: number; // This would come from backend or be calculated
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchMatchedUsers(); // Fetch matched users from backend (dummy data for now)
        const matchesWithImages: Match[] = await Promise.all(
          fetchedUsers.map(async (user: any) => {
            const imageUrl = await fetchUserImage(user.id);
            // Assuming the backend returns 'name', 'course', 'interests' for matched users
            // For now, let's use some placeholder data for these fields
            return {
              id: user.id.toString(),
              name: user.username, // Using username as name for now
              course: "Computer Science", // Placeholder
              matchDate: "Matched recently", // Placeholder
              image: imageUrl,
              interests: ["AI", "Web Dev"], // Placeholder
              matchPercentage: Math.floor(Math.random() * 20) + 80, // Random percentage for demo
            };
          })
        );
        setMatches(matchesWithImages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p>Loading matches...</p>
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

  if (matches.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="glass-effect animate-bounce-in p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            No Matches Yet!
          </h2>
          <p className="text-muted-foreground">Keep swiping to find your study buddies!</p>
        </Card>
      </div>
    );
  }

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
                    <img
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
                    <Link to={`/messages/${match.id}`}>
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
  );
}

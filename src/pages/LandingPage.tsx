import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, BookOpen, Users, ArrowRight, CheckCircle, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/40 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/40 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
             <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm border-primary/50 text-primary backdrop-blur-sm">
              <span className="mr-2">🎉</span> Now available for Sathyabama University
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Find Your Perfect <span className="text-primary">Study Partner</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with students who share your courses, interests, and academic goals. 
              Stop studying alone and start collaborating today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/discovery">
                <Button size="lg" className="h-12 px-8 text-lg font-semibold gradient-button shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  Find a Buddy
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="h-12 px-8 text-lg hover:bg-white/5">
                How it works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto text-center px-4">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6">Trusted by students from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-70 hover:opacity-100 transition-opacity">
            {/* Placeholder Logos - text for now */}
            <div className="flex items-center gap-2 text-xl font-bold text-white/80">
                <GraduationCap className="h-8 w-8" />
                Sathyabama University
            </div>
             <div className="flex items-center gap-2 text-xl font-bold text-white/50">
                SRM University
            </div>
             <div className="flex items-center gap-2 text-xl font-bold text-white/50">
                VIT
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: MapPin,
                title: "Campus Connect",
                description: "Find study partners right on your campus. Verified student profiles ensure safety and relevance."
              },
              {
                icon: BookOpen,
                title: "Course Matching",
                description: "Filter by major, course, or specific subjects. Find someone who's studying exactly what you are."
              },
              {
                icon: Users,
                title: "Collaborative Growth",
                description: "Share notes, quiz each other, and work on projects together. Success is better when shared."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Trust Section (Lazy Signup hint) */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-black/40">
        <div className="container mx-auto max-w-4xl text-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                 {[
                     { value: "500+", label: "Active Students" },
                     { value: "50+", label: "Study Groups" },
                     { value: "1200+", label: "Messages Sent" },
                     { value: "4.8/5", label: "Student Rating" }
                 ].map((stat, i) => (
                     <div key={i} className="space-y-1">
                         <div className="text-3xl font-bold text-white">{stat.value}</div>
                         <div className="text-sm text-muted-foreground">{stat.label}</div>
                     </div>
                 ))}
             </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
          <h2 className="text-3xl font-bold mb-6">Ready to ace your exams?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of students finding their perfect study partners today. 
            It's free, easy, and designed for your academic success.
          </p>
          <Link to="/discovery">
            <Button size="lg" className="gradient-button h-12 px-8 shadow-xl">
              Get Started Now
            </Button>
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Free for students</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Verified profiles</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Secure messaging</span>
          </div>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
      </footer>
    </div>
  )
}

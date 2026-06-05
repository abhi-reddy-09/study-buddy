import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Brain, Calendar, Sparkles, Target, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyBuddy — Find Your Study Partner" },
      {
        name: "description",
        content:
          "AI-driven matching that connects you with students who share your courses, learning style, and academic goals.",
      },
      { property: "og:title", content: "StudyBuddy — Find Your Study Partner" },
      {
        property: "og:description",
        content: "AI-driven matching for genuinely productive study sessions.",
      },
    ],
  }),
  component: Index,
});

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold">
            S
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">StudyBuddy</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#faq" className="transition hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex">
            Login
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center md:pt-32 md:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm shadow-sm">
          <span>🎉</span>
          <span className="text-foreground/80">Now available for Sathyabama University</span>
        </div>

        <h1 className="mt-10 font-display text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
          <span className="text-fade-mask">Find Your</span>
          <br />
          <span>Study Partner</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Connect with students who share your courses, interests, and academic goals.
          Stop studying alone and start collaborating today.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button className="group inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition hover:bg-muted">
            Find a Buddy
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
          <a
            href="#how"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-foreground/80 transition hover:text-foreground"
          >
            How it works
          </a>
        </div>

        <div className="mt-24">
          <p className="text-xs font-medium tracking-[0.2em] text-subtle-foreground">
            TRUSTED BY STUDENTS FROM
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-subtle-foreground">
            {["Sathyabama", "IIT Madras", "Anna University", "VIT", "SRM"].map((u) => (
              <span key={u} className="font-display text-xl font-semibold tracking-tight">
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Brain,
    title: "AI Compatibility Engine",
    desc: "We analyze academic strengths, weaknesses, and learning styles to surface matches that actually work.",
  },
  {
    icon: Calendar,
    title: "Schedule-Aware Matching",
    desc: "Only see buddies whose availability overlaps with yours — no more endless coordination loops.",
  },
  {
    icon: Target,
    title: "Goal-Aligned Groups",
    desc: "From exam prep to project sprints, get matched by what you're trying to accomplish.",
  },
  {
    icon: Sparkles,
    title: "Beyond Basic Filters",
    desc: "Move past course codes. Match on study habits, pace, and preferred session formats.",
  },
  {
    icon: Users,
    title: "Group Formation",
    desc: "Spin up small, balanced study groups where skills complement instead of overlap.",
  },
  {
    icon: Zap,
    title: "Instant Sessions",
    desc: "Jump into a study room the moment a match accepts — no scheduling friction.",
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">FEATURES</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Matching that respects how you actually learn.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group bg-card p-8 transition hover:bg-background">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Build your profile", desc: "Share your courses, strengths, weak spots, and how you like to study." },
  { n: "02", title: "Get matched", desc: "Our engine ranks compatible peers across academic fit and schedule overlap." },
  { n: "03", title: "Start collaborating", desc: "Accept a match, launch a session, and turn solo grind into shared progress." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">HOW IT WORKS</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Three steps to a better study session.
            </h2>
          </div>
          <div className="space-y-px overflow-hidden rounded-2xl border border-border">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-8 bg-card p-8 not-last:border-b not-last:border-border">
                <span className="font-display text-2xl font-semibold text-muted-foreground">{s.n}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
          Stop studying alone.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/70">
          Join the students using StudyBuddy to find partners who push them forward.
        </p>
        <button className="mt-10 inline-flex items-center gap-2 rounded-lg bg-background px-7 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:opacity-90">
          Find a Buddy
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground text-xs font-bold">
            S
          </div>
          <span className="font-display font-semibold text-foreground">StudyBuddy</span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="transition hover:text-foreground">Privacy</a>
          <a href="#" className="transition hover:text-foreground">Terms</a>
          <a href="#" className="transition hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

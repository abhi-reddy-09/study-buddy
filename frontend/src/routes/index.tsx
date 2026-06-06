import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  CircleUserRound,
  Goal,
  LogOut,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

function getApiBaseUrl() {
  const configured =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    (import.meta.env.VITE_API_URL as string | undefined);

  if (typeof window === "undefined") return configured ?? "http://localhost:5001";

  const browserHost = window.location.hostname;
  if (configured) {
    try {
      const url = new URL(configured);
      if (
        (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        browserHost !== "localhost" &&
        browserHost !== "127.0.0.1"
      ) {
        url.hostname = browserHost;
        return url.toString().replace(/\/$/, "");
      }
      return configured.replace(/\/$/, "");
    } catch {
      return configured.replace(/\/$/, "");
    }
  }

  return `${window.location.protocol}//${browserHost}:5001`;
}

const API_BASE_URL = getApiBaseUrl();

function getBackendUnavailableMessage() {
  if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
    const dnsHint = API_BASE_URL.includes(".up.railway.app")
      ? " If this domain does not resolve on your network, switch DNS to 1.1.1.1 or 8.8.8.8, or attach a custom domain in Railway."
      : "";

    return `Could not reach the production backend at ${API_BASE_URL}. Check that VITE_API_URL is correct and ALLOWED_ORIGIN includes ${window.location.origin}.${dnsHint}`;
  }

  return `Could not reach the backend at ${API_BASE_URL}. Start the backend with "npm run dev" in the backend folder and make sure MySQL is running.`;
}

type Profile = {
  firstName: string;
  lastName: string;
  major?: string | null;
  bio?: string | null;
  studyHabits?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
};

type User = {
  id: string;
  email?: string;
  profile: Profile | null;
};

type Match = {
  id: string;
  initiatorId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  initiator?: Pick<User, "id" | "profile">;
  receiver?: Pick<User, "id" | "profile">;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  createdAt: string;
  readAt: string | null;
};

type Conversation = {
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
};

type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

type DashboardStep = "profile" | "discover" | "requests" | "matches" | "chat";

const storageKey = "studybuddy.session";
const inputClass = "field w-full rounded-md px-3 py-2.5 text-sm";
const primaryButtonClass =
  "primary-action inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60";
const secondaryButtonClass =
  "soft-action inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60";

const featureItems = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI Compatibility Engine",
    text: "We analyze academic strengths, weak spots, and learning styles to surface matches that actually work.",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: "Schedule-Aware Matching",
    text: "Only see buddies whose availability overlaps with yours, so planning a session stays simple.",
  },
  {
    icon: <Goal className="h-5 w-5" />,
    title: "Goal-Aligned Groups",
    text: "From exam prep to project sprints, get matched by what you're trying to accomplish.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Beyond Basic Filters",
    text: "Move past course codes. Match on study habits, pace, and preferred session formats.",
  },
  {
    icon: <UsersRound className="h-5 w-5" />,
    title: "Group Formation",
    text: "Spin up small, balanced study groups where skills complement instead of overlap.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Instant Sessions",
    text: "Jump into a study room the moment a match accepts, with no scheduling friction.",
  },
];

const howItWorks = [
  {
    title: "Build your profile",
    text: "Share your courses, strengths, weak spots, and how you like to study.",
  },
  {
    title: "Get matched",
    text: "Our engine ranks compatible peers across academic fit and schedule overlap.",
  },
  {
    title: "Start collaborating",
    text: "Accept a match, launch a session, and turn solo grind into shared progress.",
  },
];

const dashboardSteps: Array<{ id: DashboardStep; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "discover", label: "Discover" },
  { id: "requests", label: "Requests" },
  { id: "matches", label: "Matches" },
  { id: "chat", label: "Chat" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyBuddy" },
      { name: "description", content: "Find and message study partners." },
    ],
  }),
  component: Index,
});

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(getBackendUnavailableMessage());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed");
  }

  return data as T;
}

function displayName(user?: Pick<User, "id" | "profile"> | null) {
  const profile = user?.profile;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return name || "Study buddy";
}

function avatarUrl(
  seed: string,
  profile?: Pick<Profile, "avatarUrl" | "firstName" | "lastName"> | null,
) {
  if (profile?.avatarUrl) return profile.avatarUrl;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || seed;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=111827,e5e7eb,f8fafc&fontWeight=700`;
}

function getInitialSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const [session, setSession] = useState<Session | null>(() => getInitialSession());
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState(`Connected to backend at ${API_BASE_URL}.`);
  const [isBusy, setIsBusy] = useState(false);
  const [activeStep, setActiveStep] = useState<DashboardStep>("profile");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    major: "",
    studyHabits: "",
    gender: "PREFER_NOT_TO_SAY",
  });
  const [profileForm, setProfileForm] = useState({
    major: "",
    bio: "",
    studyHabits: "",
    avatarUrl: "",
  });
  const [discovery, setDiscovery] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const token = session?.accessToken;
  const currentUserId = session?.user.id;
  const pendingReceived = useMemo(
    () =>
      matches.filter((match) => match.status === "PENDING" && match.receiverId === currentUserId),
    [matches, currentUserId],
  );
  const activeMatches = useMemo(
    () => matches.filter((match) => match.status === "ACCEPTED"),
    [matches],
  );

  useEffect(() => {
    if (session && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
      setProfileForm({
        major: session.user.profile?.major ?? "",
        bio: session.user.profile?.bio ?? "",
        studyHabits: session.user.profile?.studyHabits ?? "",
        avatarUrl: session.user.profile?.avatarUrl ?? "",
      });
    }
  }, [session]);

  useEffect(() => {
    if (token) void loadDashboard(token);
    // Dashboard should auto-sync only when auth changes; button handlers call loadDashboard directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadDashboard(authToken = token) {
    if (!authToken) return;
    setIsBusy(true);
    try {
      const [me, nextDiscovery, nextMatches, nextConversations] = await Promise.all([
        apiRequest<{ user: User }>("/auth/me", {}, authToken),
        apiRequest<User[]>("/discovery", {}, authToken),
        apiRequest<Match[]>("/matches", {}, authToken),
        apiRequest<Conversation[]>("/messages/conversations", {}, authToken),
      ]);
      setSession((current) => current && { ...current, user: me.user });
      setDiscovery(nextDiscovery);
      setMatches(nextMatches);
      setConversations(nextConversations);
      setStatus("Dashboard synced with the backend.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load dashboard.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      const nextSession = await apiRequest<Session>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      setSession(nextSession);
      setActiveStep("discover");
      setStatus(`Welcome back, ${displayName(nextSession.user)}. Discover profiles are loading.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      const nextSession = await apiRequest<Session>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      setSession(nextSession);
      setActiveStep("discover");
      setStatus(`Account created for ${displayName(nextSession.user)}. You can view profiles now.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setIsBusy(true);
    try {
      const profile = await apiRequest<Profile>(
        "/profile",
        {
          method: "PUT",
          body: JSON.stringify(profileForm),
        },
        token,
      );
      setSession((current) => current && { ...current, user: { ...current.user, profile } });
      setActiveStep("discover");
      setStatus("Profile saved. Next step: discover a study buddy.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function requestMatch(receiverId: string) {
    if (!token) return;
    setIsBusy(true);
    try {
      await apiRequest<Match>(
        "/matches",
        {
          method: "POST",
          body: JSON.stringify({ receiverId }),
        },
        token,
      );
      setStatus("Match request sent. Watch your requests and active matches.");
      await loadDashboard(token);
      setActiveStep("requests");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not request match.");
    } finally {
      setIsBusy(false);
    }
  }

  async function passUser(passedUserId: string) {
    if (!token) return;
    setIsBusy(true);
    try {
      await apiRequest<void>(
        "/discovery/pass",
        {
          method: "POST",
          body: JSON.stringify({ passedUserId }),
        },
        token,
      );
      setDiscovery((users) => users.filter((user) => user.id !== passedUserId));
      setStatus("Skipped that profile.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not pass user.");
    } finally {
      setIsBusy(false);
    }
  }

  async function decideMatch(matchId: string, decision: "accept" | "reject") {
    if (!token) return;
    setIsBusy(true);
    try {
      await apiRequest<Match>(`/matches/${matchId}/${decision}`, { method: "PUT" }, token);
      setStatus(
        decision === "accept" ? "Match accepted. Open chat to say hello." : "Match rejected.",
      );
      await loadDashboard(token);
      setActiveStep(decision === "accept" ? "chat" : "discover");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update match.");
    } finally {
      setIsBusy(false);
    }
  }

  async function openConversation(conversation: Conversation) {
    if (!token) return;
    setSelectedConversation(conversation);
    setActiveStep("chat");
    setIsBusy(true);
    try {
      const nextMessages = await apiRequest<Message[]>(
        `/messages/conversations/${conversation.otherUser.id}`,
        {},
        token,
      );
      setMessages(nextMessages);
      await apiRequest<{ ok: boolean }>(
        `/messages/conversations/${conversation.otherUser.id}/read`,
        { method: "PUT" },
        token,
      );
      setStatus(`Opened chat with ${conversation.otherUser.firstName || "your buddy"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not open conversation.");
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedConversation || !messageText.trim()) return;
    setIsBusy(true);
    try {
      const message = await apiRequest<Message>(
        `/messages/conversations/${selectedConversation.otherUser.id}`,
        {
          method: "POST",
          body: JSON.stringify({ content: messageText }),
        },
        token,
      );
      setMessages((items) => [...items, message]);
      setMessageText("");
      setStatus("Message sent.");
      await loadDashboard(token);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setIsBusy(false);
    }
  }

  async function clearConversation() {
    if (!token || !selectedConversation) return;
    setIsBusy(true);
    try {
      await apiRequest<void>(
        `/messages/conversations/${selectedConversation.otherUser.id}`,
        { method: "DELETE" },
        token,
      );
      setMessages([]);
      setStatus("Conversation cleared.");
      await loadDashboard(token);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not clear conversation.");
    } finally {
      setIsBusy(false);
    }
  }

  function openAuth(nextMode: "login" | "register") {
    setMode(nextMode);
    window.setTimeout(() => scrollToSection("auth"), 0);
  }

  function logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setSession(null);
    setDiscovery([]);
    setMatches([]);
    setConversations([]);
    setMessages([]);
    setSelectedConversation(null);
    setActiveStep("profile");
    setStatus("Logged out.");
  }

  return (
    <div className="app-canvas min-h-screen">
      <Header
        session={session}
        onLogin={() => void navigate({ to: "/login" })}
        onRegister={() => openAuth("register")}
        onSync={() => void loadDashboard()}
        onLogout={logout}
      />
      {!session ? (
        <main>
          <LandingHero onFindBuddy={() => openAuth("register")} />
          <FeaturesSection />
          <HowItWorksSection onFindBuddy={() => openAuth("register")} />
          <AuthSection
            mode={mode}
            setMode={setMode}
            status={status}
            isBusy={isBusy}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
          />
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-5 py-8">
          <div className="status-strip mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-foreground" />
              <span>{isBusy ? "Working..." : status}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{API_BASE_URL}</span>
          </div>

          <section className="dashboard-shell">
            <aside className="dashboard-sidebar">
              <div className="flex items-center gap-3">
                <UserAvatar id={session.user.id} profile={session.user.profile} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <h1 className="truncate text-2xl font-bold">{displayName(session.user)}</h1>
                </div>
              </div>
              <p className="mt-4 break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                {session.user.email}
              </p>
              <div className="mt-6 grid gap-2">
                {dashboardSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`step-button ${activeStep === step.id ? "is-active" : ""}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {step.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Discover" value={discovery.length} />
                <MiniMetric label="Requests" value={pendingReceived.length} />
                <MiniMetric label="Chats" value={conversations.length} />
              </div>
            </aside>

            <section className="dashboard-main">
              {activeStep === "profile" && (
                <ProfileStep
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  saveProfile={saveProfile}
                  isBusy={isBusy}
                  onNext={() => setActiveStep("discover")}
                />
              )}
              {activeStep === "discover" && (
                <DiscoverStep
                  discovery={discovery}
                  requestMatch={requestMatch}
                  passUser={passUser}
                  isBusy={isBusy}
                />
              )}
              {activeStep === "requests" && (
                <RequestsStep
                  pendingReceived={pendingReceived}
                  decideMatch={decideMatch}
                  currentUserId={currentUserId}
                />
              )}
              {activeStep === "matches" && (
                <MatchesStep
                  activeMatches={activeMatches}
                  currentUserId={currentUserId}
                  conversations={conversations}
                  openConversation={openConversation}
                />
              )}
              {activeStep === "chat" && (
                <ChatStep
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  messages={messages}
                  messageText={messageText}
                  setMessageText={setMessageText}
                  openConversation={openConversation}
                  clearConversation={clearConversation}
                  sendMessage={sendMessage}
                  currentUserId={currentUserId}
                  isBusy={isBusy}
                />
              )}
            </section>
          </section>
        </main>
      )}
    </div>
  );
}

function Header({
  session,
  onLogin,
  onRegister,
  onSync,
  onLogout,
}: {
  session: Session | null;
  onLogin: () => void;
  onRegister: () => void;
  onSync: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-5">
        <button type="button" onClick={() => scrollToSection("top")} className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-foreground text-lg font-bold text-background">
            S
          </span>
          <span className="text-2xl font-bold tracking-tight">StudyBuddy</span>
        </button>
        {!session && (
          <nav className="hidden items-center gap-12 text-lg text-muted-foreground md:flex">
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-foreground"
            >
              How it works
            </button>
            <button type="button" onClick={() => scrollToSection("features")} className="hover:text-foreground">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection("faq")} className="hover:text-foreground">
              FAQ
            </button>
          </nav>
        )}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <button type="button" onClick={onSync} className={secondaryButtonClass}>
                <RefreshCw className="h-4 w-4" />
                Sync
              </button>
              <button type="button" onClick={onLogout} className={primaryButtonClass}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onLogin} className={secondaryButtonClass}>
                Login
              </button>
              <button type="button" onClick={onRegister} className={primaryButtonClass}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LandingHero({ onFindBuddy }: { onFindBuddy: () => void }) {
  return (
    <section id="top" className="hero-section">
      <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col items-center justify-center px-5 text-center">
        <div className="hero-pill">Available for Sathyabama University</div>
        <h1 className="mt-16 max-w-4xl text-balance text-7xl font-black leading-[0.95] tracking-tight md:text-8xl">
          <span className="text-fade-mask">Find</span> Your
          <br />
          Study Partner
        </h1>
        <p className="mt-8 max-w-3xl text-2xl leading-snug text-muted-foreground">
          Connect with students who share your courses, interests, and academic goals. Stop studying
          alone and start collaborating today.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <button type="button" onClick={onFindBuddy} className={`${secondaryButtonClass} px-8 py-4 text-lg`}>
            Find a Buddy
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="text-lg font-semibold text-foreground"
          >
            How it works
          </button>
        </div>
        <div className="mt-28">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-subtle-foreground">
            Trusted by students from
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-10 text-2xl font-bold text-subtle-foreground">
            <span>Sathyabama</span>
            <span>IIT Madras</span>
            <span>Anna University</span>
            <span>VIT</span>
            <span>SRM</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="section-band">
      <div className="mx-auto max-w-7xl px-5 py-28">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-muted-foreground">
          Features
        </p>
        <h2 className="mt-8 max-w-4xl text-6xl font-black leading-none tracking-tight">
          Matching that respects how you actually learn.
        </h2>
        <div className="feature-grid mt-20">
          {featureItems.map((item) => (
            <article key={item.title} className="feature-cell">
              <span className="icon-tile">{item.icon}</span>
              <h3 className="mt-10 text-2xl font-bold">{item.title}</h3>
              <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ onFindBuddy }: { onFindBuddy: () => void }) {
  return (
    <>
      <section id="how-it-works" className="section-band border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.55fr_1fr]">
          <h2 className="max-w-md text-6xl font-black leading-none tracking-tight">
            Three steps to a better study session.
          </h2>
          <div className="steps-panel">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="work-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-xl text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="dark-cta">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-36 text-center">
          <h2 className="text-6xl font-black tracking-tight text-white">Stop studying alone.</h2>
          <p className="mt-8 max-w-2xl text-2xl leading-snug text-white/62">
            Join the students using StudyBuddy to find partners who push them forward.
          </p>
          <button
            type="button"
            onClick={onFindBuddy}
            className={`${secondaryButtonClass} mt-16 bg-white px-8 py-4 text-lg`}
          >
            Find a Buddy
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </>
  );
}

function AuthSection(props: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  status: string;
  isBusy: boolean;
  loginForm: { email: string; password: string };
  setLoginForm: (value: { email: string; password: string }) => void;
  registerForm: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    major: string;
    studyHabits: string;
    gender: string;
  };
  setRegisterForm: (value: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    major: string;
    studyHabits: string;
    gender: string;
  }) => void;
  handleLogin: (event: FormEvent<HTMLFormElement>) => void;
  handleRegister: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section id="auth" className="section-band border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[0.9fr_430px]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-muted-foreground">
            Get started
          </p>
          <h2 className="mt-6 max-w-3xl text-6xl font-black leading-none tracking-tight">
            Create your profile, then move through the matching steps.
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">{props.status}</p>
        </div>
        <AuthPanel {...props} />
      </div>
    </section>
  );
}

function AuthPanel({
  mode,
  setMode,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  handleLogin,
  handleRegister,
  isBusy,
}: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  loginForm: { email: string; password: string };
  setLoginForm: (value: { email: string; password: string }) => void;
  registerForm: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    major: string;
    studyHabits: string;
    gender: string;
  };
  setRegisterForm: (value: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    major: string;
    studyHabits: string;
    gender: string;
  }) => void;
  handleLogin: (event: FormEvent<HTMLFormElement>) => void;
  handleRegister: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
}) {
  return (
    <div className="elevated-panel rounded-md p-5">
      <div className="grid grid-cols-2 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded px-3 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            value={loginForm.email}
            onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
          <input
            value={loginForm.password}
            onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
          <button type="submit" disabled={isBusy} className={`${primaryButtonClass} w-full`}>
            Login
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={registerForm.firstName}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, firstName: event.target.value })
              }
              placeholder="First name"
              required
              className={inputClass}
            />
            <input
              value={registerForm.lastName}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, lastName: event.target.value })
              }
              placeholder="Last name"
              required
              className={inputClass}
            />
          </div>
          <input
            value={registerForm.email}
            onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
          <input
            value={registerForm.password}
            onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
            placeholder="Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
          <input
            value={registerForm.major}
            onChange={(event) => setRegisterForm({ ...registerForm, major: event.target.value })}
            placeholder="Major"
            className={inputClass}
          />
          <textarea
            value={registerForm.studyHabits}
            onChange={(event) =>
              setRegisterForm({ ...registerForm, studyHabits: event.target.value })
            }
            placeholder="Study habits"
            className={`${inputClass} min-h-20`}
          />
          <select
            value={registerForm.gender}
            onChange={(event) => setRegisterForm({ ...registerForm, gender: event.target.value })}
            className={inputClass}
          >
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="NON_BINARY">Non-binary</option>
          </select>
          <button type="submit" disabled={isBusy} className={`${primaryButtonClass} w-full`}>
            Register
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}

function ProfileStep({
  profileForm,
  setProfileForm,
  saveProfile,
  isBusy,
  onNext,
}: {
  profileForm: { major: string; bio: string; studyHabits: string; avatarUrl: string };
  setProfileForm: (value: {
    major: string;
    bio: string;
    studyHabits: string;
    avatarUrl: string;
  }) => void;
  saveProfile: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  onNext: () => void;
}) {
  return (
    <div>
      <StepTitle
        eyebrow="Step 01"
        title="Build your profile"
        text="This saves to the backend profile endpoint and unlocks better discovery cards."
      />
      <form onSubmit={saveProfile} className="mt-8 grid gap-4">
        <input
          value={profileForm.major}
          onChange={(event) => setProfileForm({ ...profileForm, major: event.target.value })}
          placeholder="Major"
          className={inputClass}
        />
        <textarea
          value={profileForm.bio}
          onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
          placeholder="Bio"
          className={`${inputClass} min-h-28`}
        />
        <textarea
          value={profileForm.studyHabits}
          onChange={(event) => setProfileForm({ ...profileForm, studyHabits: event.target.value })}
          placeholder="Study habits"
          className={`${inputClass} min-h-28`}
        />
        <input
          value={profileForm.avatarUrl}
          onChange={(event) => setProfileForm({ ...profileForm, avatarUrl: event.target.value })}
          placeholder="Avatar URL"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={isBusy} className={primaryButtonClass}>
            <Save className="h-4 w-4" />
            Save profile
          </button>
          <button type="button" onClick={onNext} className={secondaryButtonClass}>
            Continue to discover
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function DiscoverStep({
  discovery,
  requestMatch,
  passUser,
  isBusy,
}: {
  discovery: User[];
  requestMatch: (id: string) => void;
  passUser: (id: string) => void;
  isBusy: boolean;
}) {
  return (
    <div>
      <StepTitle
        eyebrow="Step 02"
        title="Swipe through compatible students"
        text="Swipe right to request a match or pass to skip. Each action is saved through your backend."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {discovery.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            primaryLabel="Swipe right"
            primaryIcon={<UserPlus className="h-4 w-4" />}
            onPrimary={() => requestMatch(user.id)}
            secondaryLabel="Pass"
            secondaryIcon={<X className="h-4 w-4" />}
            onSecondary={() => passUser(user.id)}
            disabled={isBusy}
          />
        ))}
        {discovery.length === 0 && (
          <EmptyState
            icon={<Search className="h-5 w-5" />}
            text="No new students yet. Register another account to test matching."
          />
        )}
      </div>
    </div>
  );
}

function RequestsStep({
  pendingReceived,
  decideMatch,
}: {
  pendingReceived: Match[];
  decideMatch: (id: string, decision: "accept" | "reject") => void;
  currentUserId?: string;
}) {
  return (
    <div>
      <StepTitle
        eyebrow="Step 03"
        title="Review incoming requests"
        text="Accepting a request creates an active match and opens the next chat step."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {pendingReceived.map((match) => (
          <UserCard
            key={match.id}
            user={match.initiator ?? { id: match.initiatorId, profile: null }}
            primaryLabel="Accept"
            primaryIcon={<Check className="h-4 w-4" />}
            onPrimary={() => decideMatch(match.id, "accept")}
            secondaryLabel="Reject"
            secondaryIcon={<X className="h-4 w-4" />}
            onSecondary={() => decideMatch(match.id, "reject")}
          />
        ))}
        {pendingReceived.length === 0 && (
          <EmptyState
            icon={<UserPlus className="h-5 w-5" />}
            text="No incoming match requests yet."
          />
        )}
      </div>
    </div>
  );
}

function MatchesStep({
  activeMatches,
  currentUserId,
  conversations,
  openConversation,
}: {
  activeMatches: Match[];
  currentUserId?: string;
  conversations: Conversation[];
  openConversation: (conversation: Conversation) => void;
}) {
  return (
    <div>
      <StepTitle
        eyebrow="Step 04"
        title="Active matches"
        text="Accepted matches become conversations so you can start collaborating."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {activeMatches.map((match) => {
          const other = match.initiatorId === currentUserId ? match.receiver : match.initiator;
          const conversation = conversations.find((item) => item.otherUser.id === other?.id);
          return (
            <div key={match.id} className="elevated-panel rounded-md p-5">
              <div className="flex items-center gap-3">
                <UserAvatar id={other?.id ?? match.id} profile={other?.profile} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{displayName(other)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {other?.profile?.major ?? "No major listed"}
                  </p>
                </div>
              </div>
              <button
                disabled={!conversation}
                onClick={() => conversation && openConversation(conversation)}
                className={`${primaryButtonClass} mt-5 w-full`}
              >
                Open chat
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {activeMatches.length === 0 && (
          <EmptyState
            icon={<Check className="h-5 w-5" />}
            text="Accept a request to create an active match."
          />
        )}
      </div>
    </div>
  );
}

function ChatStep({
  conversations,
  selectedConversation,
  messages,
  messageText,
  setMessageText,
  openConversation,
  clearConversation,
  sendMessage,
  currentUserId,
  isBusy,
}: {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  messageText: string;
  setMessageText: (value: string) => void;
  openConversation: (conversation: Conversation) => void;
  clearConversation: () => void;
  sendMessage: (event: FormEvent<HTMLFormElement>) => void;
  currentUserId?: string;
  isBusy: boolean;
}) {
  return (
    <div>
      <StepTitle
        eyebrow="Step 05"
        title="Start collaborating"
        text="Open a conversation, send messages, and keep the session moving."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.otherUser.id}
              onClick={() => openConversation(conversation)}
              className={`conversation-button ${selectedConversation?.otherUser.id === conversation.otherUser.id ? "is-active" : ""}`}
            >
              <UserAvatar
                id={conversation.otherUser.id}
                profile={{
                  firstName: conversation.otherUser.firstName,
                  lastName: conversation.otherUser.lastName,
                  avatarUrl: conversation.otherUser.avatarUrl,
                }}
              />
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-bold">
                  {[conversation.otherUser.firstName, conversation.otherUser.lastName]
                    .filter(Boolean)
                    .join(" ") || "Study buddy"}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {conversation.lastMessage?.content ?? "No messages yet"}
                </span>
              </span>
              {conversation.unreadCount > 0 && (
                <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          ))}
          {conversations.length === 0 && (
            <EmptyState
              icon={<MessageCircle className="h-5 w-5" />}
              text="Accepted matches appear here as chats."
            />
          )}
        </div>
        <div className="elevated-panel rounded-md p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-2xl font-bold">
              {selectedConversation
                ? selectedConversation.otherUser.firstName || "Conversation"
                : "Chat"}
            </h3>
            {selectedConversation && (
              <button onClick={clearConversation} className={secondaryButtonClass}>
                Clear
              </button>
            )}
          </div>
          <div className="mt-5 max-h-96 min-h-72 space-y-3 overflow-y-auto rounded-md bg-muted/50 p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.senderId === currentUserId ? "is-mine" : ""}`}
              >
                {message.content}
              </div>
            ))}
            {!selectedConversation && (
              <EmptyState
                icon={<MessageCircle className="h-5 w-5" />}
                text="Open a conversation to read messages."
              />
            )}
            {selectedConversation && messages.length === 0 && (
              <EmptyState
                icon={<Send className="h-5 w-5" />}
                text="No messages in this chat yet."
              />
            )}
          </div>
          <form onSubmit={sendMessage} className="mt-4 flex gap-2">
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              disabled={!selectedConversation}
              placeholder="Write a message"
              className={`${inputClass} min-w-0 flex-1 disabled:opacity-60`}
            />
            <button
              type="submit"
              disabled={!selectedConversation || !messageText.trim() || isBusy}
              className={`${primaryButtonClass} px-3`}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.28em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-5xl font-black leading-none tracking-tight">{title}</h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{text}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function UserAvatar({
  id,
  profile,
  size = "md",
}: {
  id: string;
  profile?: Pick<Profile, "avatarUrl" | "firstName" | "lastName"> | null;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  return (
    <img
      src={avatarUrl(id, profile)}
      alt=""
      className={`${dimension} shrink-0 rounded-md border border-border bg-muted object-cover`}
    />
  );
}

function UserCard({
  user,
  primaryLabel,
  primaryIcon,
  onPrimary,
  secondaryLabel,
  secondaryIcon,
  onSecondary,
  disabled,
}: {
  user: Pick<User, "id" | "profile">;
  primaryLabel: string;
  primaryIcon: ReactNode;
  onPrimary: () => void;
  secondaryLabel: string;
  secondaryIcon: ReactNode;
  onSecondary: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="elevated-panel rounded-md p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <UserAvatar id={user.id} profile={user.profile} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{displayName(user)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.profile?.major ?? "No major listed"}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 rounded-md bg-muted/70 p-3 text-sm leading-relaxed text-muted-foreground">
        {user.profile?.studyHabits || user.profile?.bio || "No study habits added yet."}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          disabled={disabled}
          onClick={onPrimary}
          className={`${primaryButtonClass} flex-1 px-3 py-2`}
        >
          {primaryIcon}
          {primaryLabel}
        </button>
        <button
          disabled={disabled}
          onClick={onSecondary}
          className={`${secondaryButtonClass} px-3 py-2`}
        >
          {secondaryIcon}
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-white p-5 text-sm text-muted-foreground">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-foreground">
            {icon}
          </span>
        )}
        <span>{text}</span>
      </div>
    </div>
  );
}

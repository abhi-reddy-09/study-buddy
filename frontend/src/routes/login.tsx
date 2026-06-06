import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

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

const storageKey = "studybuddy.session";
const inputClass = "field w-full rounded-md px-3 py-2.5 text-sm";
const primaryButtonClass =
  "primary-action inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60";
const secondaryButtonClass =
  "soft-action inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60";

type Profile = {
  firstName: string;
  lastName: string;
  major?: string | null;
  studyHabits?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
};

type Session = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    profile: Profile | null;
  };
};

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | StudyBuddy" },
      { name: "description", content: "Login or create a StudyBuddy account." },
    ],
  }),
  component: LoginPage,
});

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Could not reach the backend at ${API_BASE_URL}. Start the backend with "npm run dev" in the backend folder and make sure MySQL is running.`,
    );
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed");
  }

  return data as T;
}

function displayName(session: Session) {
  const profile = session.user.profile;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return name || "Study buddy";
}

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState(`Connected to backend at ${API_BASE_URL}.`);
  const [isBusy, setIsBusy] = useState(false);
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

  function saveSession(session: Session) {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
    setStatus(`Welcome, ${displayName(session)}. Opening your dashboard.`);
    window.location.assign("/");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    try {
      const session = await apiRequest<Session>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      saveSession(session);
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
      const session = await apiRequest<Session>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      saveSession(session);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-canvas min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_440px]">
        <div>
          <a href="/" className={`${secondaryButtonClass} mb-12`}>
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-muted-foreground">
            StudyBuddy
          </p>
          <h1 className="mt-6 max-w-3xl text-6xl font-black leading-none tracking-tight">
            Login, register, and start matching with study partners.
          </h1>
          <div className="status-strip mt-8 flex items-start gap-3 rounded-md px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            <span>{isBusy ? "Working..." : status}</span>
          </div>
        </div>

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
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, email: event.target.value })
                }
                placeholder="Email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
              <input
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, password: event.target.value })
                }
                placeholder="Password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputClass}
              />
              <input
                value={registerForm.major}
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, major: event.target.value })
                }
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
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, gender: event.target.value })
                }
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
      </section>
    </main>
  );
}

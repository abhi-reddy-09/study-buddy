import { useAuth } from "@/src/contexts/AuthContext"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, login } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please log in to continue.</p>
        <button
          type="button"
          onClick={login}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Log in with Google
        </button>
      </div>
    )
  }

  return <>{children}</>
}

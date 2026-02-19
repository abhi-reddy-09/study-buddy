import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  profile?: {
    avatarUrl?: string | null
    firstName?: string | null
    lastName?: string | null
  } | null
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ profile, className, fallbackClassName }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  useEffect(() => {
    setImgError(false)
  }, [profile?.avatarUrl])
  const initials = useMemo(() => {
    const first = profile?.firstName?.[0] || ""
    const last = profile?.lastName?.[0] || ""
    return `${first}${last}`.toUpperCase() || "?"
  }, [profile?.firstName, profile?.lastName])

  return (
    <Avatar className={className}>
      {profile?.avatarUrl && !imgError && (
        <AvatarImage src={profile.avatarUrl} alt={`${profile?.firstName || "User"} avatar`} onError={() => setImgError(true)} />
      )}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )
}

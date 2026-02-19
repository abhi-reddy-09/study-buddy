export const DICEBEAR_BASE_URL = "https://api.dicebear.com/7.x"

export type DiceBearStyle = "initials" | "adventurer" | "bottts" | "avataaars"
export type ProfileGender = "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY"

export function getDefaultAvatarStyleForGender(gender?: ProfileGender): DiceBearStyle {
  if (gender === "MALE") return "adventurer"
  if (gender === "FEMALE") return "avataaars"
  return "initials"
}

export function buildDiceBearAvatarUrl(style: DiceBearStyle, seed: string): string {
  const encodedSeed = encodeURIComponent(seed.trim())
  return `${DICEBEAR_BASE_URL}/${style}/svg?seed=${encodedSeed}`
}

import { z } from 'zod';

const optionalString = (maxLen: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => !val || val.length <= maxLen, `Must be at most ${maxLen} characters`);

export const optionalAvatarUrl = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val))
  .refine((val) => !val || val.length <= 500, 'Must be at most 500 characters')
  .refine((val) => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return url.protocol === 'https:' && url.hostname === 'api.dicebear.com';
    } catch {
      return false;
    }
  }, 'Must be a valid DiceBear URL');

export const updateProfileSchema = z.object({
  major: optionalString(200),
  bio: optionalString(2000),
  studyHabits: optionalString(2000),
  avatarUrl: optionalAvatarUrl,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

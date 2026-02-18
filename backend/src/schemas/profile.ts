import { z } from 'zod';

const optionalString = (maxLen: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => !val || val.length <= maxLen, `Must be at most ${maxLen} characters`);

export const updateProfileSchema = z.object({
  major: optionalString(200),
  bio: optionalString(2000),
  studyHabits: optionalString(2000),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters')
  .trim();

const optionalString = (maxLen: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => !val || val.length <= maxLen, `Must be at most ${maxLen} characters`);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  major: optionalString(200),
  studyHabits: optionalString(2000),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

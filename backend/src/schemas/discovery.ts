import { z } from 'zod';

export const passSchema = z.object({
  passedUserId: z.string().min(1, 'passedUserId is required'),
});

export type PassInput = z.infer<typeof passSchema>;

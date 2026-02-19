import { z } from 'zod';

export const createMatchSchema = z.object({
  receiverId: z
    .string()
    .min(1, 'receiverId is required')
    .cuid('Invalid receiverId format'),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

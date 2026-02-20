# Database Schema

The app uses several core models managed by Prisma. Below is a high‑level overview; see `backend/prisma/schema.prisma` for the full source of truth.

| Model         | Key Fields                                                          | Notes                                                                 |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `User`        | `id`, `email`, `password`, `role`, `createdAt`, `updatedAt`        | CUID primary key, unique email, simple string `role` (defaults to USER) |
| `Profile`     | `firstName`, `lastName`, `major`, `bio`, `studyHabits`, `avatarUrl`, `gender` | One-to-one with `User` via `userId`; optional avatar and gender enum |
| `Match`       | `initiatorId`, `receiverId`, `status`                              | Status enum: `PENDING`, `ACCEPTED`, `REJECTED`; unique initiator+receiver pair, status index |
| `Pass`        | `userId`, `passedUserId`, `createdAt`                              | Records when a user "passes" on another so they are not shown again  |
| `Message`     | `senderId`, `receiverId`, `content`, `createdAt`, `readAt`          | Text messages between matched users; `readAt` optional for read receipts |
| `RefreshToken`| `userId`, `tokenHash`, `expiresAt`, `createdAt`                    | Stores hashed refresh tokens per user for longer‑lived sessions       |

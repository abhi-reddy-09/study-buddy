# Available Scripts

## Backend (`/backend`)

| Script                | Command                  | Description                            |
| --------------------- | ------------------------ | -------------------------------------- |
| `npm run dev`         | `nodemon src/server.ts`  | Start the dev server with hot-reload   |
| `npm run db:generate` | `npx prisma generate`   | Generate Prisma client                 |
| `npm run db:migrate`  | `npx prisma migrate dev`| Run database migrations                |
| `npm run db:studio`   | `npx prisma studio`     | Open Prisma Studio GUI                 |
| `npm run db:push`     | `npx prisma db push`    | Push schema changes without migration  |

## Frontend (`/frontend`)

| Script              | Command          | Description                     |
266: | ------------------- | ---------------- | ------------------------------- |
| `npm run dev`       | `vite`           | Start Vite dev server           |
| `npm run build`     | `vite build`     | Build for production            |
| `npm run preview`   | `vite preview`   | Preview production build        |
| `npm run lint`      | `eslint`         | Lint TypeScript/TSX files       |

# StudyBuddy

> **Find Your Perfect Study Partner** -- A full-stack web application that connects university students for collaborative study sessions, knowledge sharing, and peer support.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## Features

- **Discovery** -- Browse and search for study partners who haven't been matched with you yet, filtered automatically by existing connections
- **Matching** -- Send match requests to potential study buddies. Receivers can accept or reject incoming requests, with duplicate-match prevention built in
- **Messaging** -- Chat with matched partners through a dedicated conversations list and per-thread chat interface
- **Profiles** -- Create a student profile during registration (first name, last name) and later update your major, bio, and study habits
- **Authentication** -- JWT-based auth with bcrypt password hashing. Registration automatically creates a linked profile
- **Dark Mode** -- Toggle between light and dark themes with persistent preference via next-themes
- **Responsive** -- Fully responsive design optimized for desktop and mobile using Tailwind CSS and shadcn/ui components
- **Animations** -- Smooth page transitions and micro-interactions powered by Framer Motion
- **Landing Page** -- A polished marketing-style landing page with hero section, feature highlights, social proof, and stats

---

## Architecture

This is a **monorepo** with three directories:

- **backend/** -- Express API server with Prisma ORM and MariaDB
- **frontend/** -- React single-page application built with Vite
- **bugs/** -- Bug tracking and known issues
- **shared/** -- Shared TypeScript types (work in progress)

### Backend

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Runtime      | Node.js + TypeScript                |
| Framework    | Express 5                           |
| ORM          | Prisma 7 (with MariaDB adapter)     |
| Database     | MariaDB / MySQL                     |
| Auth         | JWT (jsonwebtoken) + bcrypt         |
| Validation   | Zod schemas per route               |
| Security     | Helmet, CORS, rate limiting (auth brute-force protection) |
| Logging      | Request logging with trace IDs      |
| Dev Server   | Nodemon + ts-node                   |

### Frontend

| Layer        | Technology                            |
| ------------ | ------------------------------------- |
| Framework    | React 18                              |
| Build Tool   | Vite 6                                |
| Styling      | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Routing      | React Router DOM 6                    |
| Animations   | Framer Motion                         |
| Forms        | React Hook Form + Zod                 |
| Theming      | next-themes                           |
| Icons        | Lucide React                          |
| Toasts       | Sonner                                |
| Charts       | Recharts                              |

---

## Database Schema

The app uses several core models managed by Prisma. Below is a high‑level overview; see `backend/prisma/schema.prisma` for the full source of truth.

| Model         | Key Fields                                                          | Notes                                                                 |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `User`        | `id`, `email`, `password`, `role`, `createdAt`, `updatedAt`        | CUID primary key, unique email, simple string `role` (defaults to USER) |
| `Profile`     | `firstName`, `lastName`, `major`, `bio`, `studyHabits`, `avatarUrl`, `gender` | One-to-one with `User` via `userId`; optional avatar and gender enum |
| `Match`       | `initiatorId`, `receiverId`, `status`                              | Status enum: `PENDING`, `ACCEPTED`, `REJECTED`; unique initiator+receiver pair, status index |
| `Pass`        | `userId`, `passedUserId`, `createdAt`                              | Records when a user "passes" on another so they are not shown again  |
| `Message`     | `senderId`, `receiverId`, `content`, `createdAt`                   | Text messages between matched users                                   |
| `RefreshToken`| `userId`, `tokenHash`, `expiresAt`, `createdAt`                    | Stores hashed refresh tokens per user for longer‑lived sessions       |

---

## API Endpoints

### Authentication (`/auth`)

| Method | Route              | Description                                       | Auth |
| ------ | ------------------ | ------------------------------------------------- | ---- |
| POST   | `/auth/register`   | Register a new user with email, password, and name | No   |
| POST   | `/auth/login`      | Login and receive a JWT token                      | No   |

### Profile (`/profile`)

| Method | Route       | Description                                  | Auth |
| ------ | ----------- | -------------------------------------------- | ---- |
| PUT    | `/profile`  | Update major, bio, and study habits          | Yes  |

### Discovery (`/discovery`)

| Method | Route         | Description                                                    | Auth |
| ------ | ------------- | -------------------------------------------------------------- | ---- |
| GET    | `/discovery`  | List all users excluding self and anyone already matched with  | Yes  |

### Matches (`/matches`)

| Method | Route                | Description                                    | Auth |
| ------ | -------------------- | ---------------------------------------------- | ---- |
| POST   | `/matches`           | Initiate a match request with another user     | Yes  |
| GET    | `/matches`           | Get all matches (sent and received)            | Yes  |
| PUT    | `/matches/:id/accept`| Accept a pending match (receiver only)         | Yes  |
| PUT    | `/matches/:id/reject`| Reject a pending match (receiver only)         | Yes  |

### Other

| Method | Route    | Description                 | Auth |
| ------ | -------- | --------------------------- | ---- |
| GET    | `/`      | API info                    | No   |
| GET    | `/health`| Liveness (process alive)    | No   |
| GET    | `/ready` | Readiness (DB check); 503 if DB down | No   |
| GET    | `/metrics` | Prometheus metrics         | No   |
| GET    | `/users` | List all users with profiles| Yes  |

---

## Frontend Routes

| Route                | Page           | Description                        |
| -------------------- | -------------- | ---------------------------------- |
| `/`                  | Discovery      | Browse and discover study partners |
| `/matches`           | Matches        | View and manage match requests     |
| `/messages`          | Messages       | Conversations list                 |
| `/messages/:chatId`  | Chat           | Individual chat thread             |
| `/profile`           | Profile        | View and edit your profile         |

The app also includes a Landing Page component with hero section, feature cards, social proof, stats, and a call-to-action footer.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MariaDB** or **MySQL** server running locally
- **npm** (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/sudo-Harshk/study-buddy.git
cd study-buddy
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```env
# Database (required for Prisma)
DATABASE_URL=mysql://your_user:your_password@localhost:3306/studybuddy

# Server
PORT=5000

# Auth (required for JWT signing/verification)
JWT_SECRET=your_random_secret_key
```

Run database migrations and generate the Prisma client:

```bash
npm run db:migrate
npm run db:generate
```

**Migration safety (production / CI):** Use `npm run db:migrate:deploy` to apply pending migrations (e.g. in CI/CD before starting the app). Never edit existing migration files; always add new migrations for schema changes. Run `npm run db:migrate:status` to check for unapplied migrations.

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (or whichever port you configured).

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file (copy from `.env.example`) to configure the API base URL:

```env
VITE_API_URL=http://localhost:5000
```

For local development, the default `http://localhost:5000` is used if `VITE_API_URL` is not set. Set it explicitly for staging/production or when the backend runs on a different port.

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Monitoring and alerting

The backend exposes operational endpoints for production visibility:

- **GET /health** — Returns 200 when the process is running. Use for liveness probes.
- **GET /ready** — Returns 200 when the app can serve traffic (DB reachable); 503 with `{ status: 'unready', reason: 'database' }` when the DB check fails. Use for readiness probes (e.g. Kubernetes).
- **GET /metrics** — Prometheus-format metrics (request count by method/route/status, request duration histogram, default Node.js metrics). Scrape this endpoint in Prometheus or your APM.

**Suggested alerts** (configure in Prometheus/Grafana, Datadog, or your host’s alerting):

1. **Readiness failing** — 503 on `/ready` for 1–2 minutes.
2. **Error rate** — 5xx rate above a threshold, or 4xx on `/auth` (e.g. brute-force).
3. **High latency** — e.g. p95 of `studybuddy_http_request_duration_ms` above a threshold.

Structured JSON logs (timestamp, level, traceId, method, url, statusCode, durationMs) can be ingested by your log pipeline and used for alerting on `level: error` or `statusCode: 500`.

---

## Environment Variables

### API alignment (frontend + backend)

For the app to work out-of-the-box, frontend and backend must agree on the API URL:

| Variable        | Location     | Default            | Purpose                                      |
| --------------- | ------------ | ------------------ | -------------------------------------------- |
| `PORT`          | `backend/.env` | `5000`             | Port the backend listens on                  |
| `VITE_API_URL`  | `frontend/.env` | `http://localhost:5000` | API base URL the frontend calls (set at build time) |

**Local development:** Backend runs on port 5000 by default. Frontend fallback is `http://localhost:5000`. No extra config needed.

**Production:** Set `PORT` on the backend. Set `VITE_API_URL` before running `npm run build` in the frontend (e.g. `https://api.yourdomain.com`). The built frontend will call that URL.

**Optional backend vars:** `ALLOWED_ORIGIN` (comma-separated origins for CORS), `DATABASE_URL` / `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for database connection.

---

## Available Scripts

### Backend (`/backend`)

| Script                | Command                  | Description                            |
| --------------------- | ------------------------ | -------------------------------------- |
| `npm run dev`         | `nodemon src/server.ts`  | Start the dev server with hot-reload   |
| `npm run db:generate` | `npx prisma generate`   | Generate Prisma client                 |
| `npm run db:migrate`  | `npx prisma migrate dev`| Run database migrations                |
| `npm run db:studio`   | `npx prisma studio`     | Open Prisma Studio GUI                 |
| `npm run db:push`     | `npx prisma db push`    | Push schema changes without migration  |

### Frontend (`/frontend`)

| Script              | Command          | Description                     |
| ------------------- | ---------------- | ------------------------------- |
| `npm run dev`       | `vite`           | Start Vite dev server           |
| `npm run build`     | `vite build`     | Build for production            |
| `npm run preview`   | `vite preview`   | Preview production build        |
| `npm run lint`      | `eslint`         | Lint TypeScript/TSX files       |

---

## Testing

Test files and test infrastructure are not included in this repository. Tests are run locally only and are excluded from version control.

---

## Tech Stack Summary

| Area       | Technologies                                                        |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 18, Vite 6, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | Express 5, Prisma 7, MariaDB, TypeScript, JWT, bcrypt               |
| Tooling    | Nodemon, ts-node, PostCSS, ESLint                                   |



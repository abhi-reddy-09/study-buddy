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
- **shared/** -- Shared TypeScript types (work in progress)

### Backend

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Runtime      | Node.js + TypeScript                |
| Framework    | Express 5                           |
| ORM          | Prisma 7 (with MariaDB adapter)     |
| Database     | MariaDB / MySQL                     |
| Auth         | JWT (jsonwebtoken) + bcrypt         |
| Testing      | Jest + ts-jest + Supertest          |
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

The app uses four core models managed by Prisma:

| Model     | Key Fields                                                          | Notes                                  |
| --------- | ------------------------------------------------------------------- | -------------------------------------- |
| `User`    | `id`, `email`, `password`, `createdAt`, `updatedAt`                 | CUID primary key, unique email         |
| `Profile` | `firstName`, `lastName`, `major`, `bio`, `studyHabits`              | One-to-one with User via `userId`      |
| `Match`   | `initiatorId`, `receiverId`, `status`                               | Status: PENDING, ACCEPTED, or REJECTED. Unique constraint on initiator+receiver pair |
| `Message` | `senderId`, `receiverId`, `content`                                 | Text content, timestamped              |

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
| GET    | `/`      | Health check                | No   |
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

Create a `.env` file in the `backend/` directory (see `.env.example` for reference):

```env
# Database connection for Prisma migrations
DATABASE_URL=mysql://your_user:your_password@localhost:3306/studybuddy

# Individual DB config (used by the MariaDB adapter at runtime)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=studybuddy

# Auth
JWT_SECRET=your_random_secret_key

# Server
PORT=5000
```

Run database migrations and generate the Prisma client:

```bash
npm run db:migrate
npm run db:generate
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (or whichever port you configured).

### 3. Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

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
| `npm test`            | `jest`                   | Run backend tests                      |

### Frontend (`/frontend`)

| Script              | Command          | Description                     |
| ------------------- | ---------------- | ------------------------------- |
| `npm run dev`       | `vite`           | Start Vite dev server           |
| `npm run build`     | `vite build`     | Build for production            |
| `npm run preview`   | `vite preview`   | Preview production build        |
| `npm run lint`      | `eslint`         | Lint TypeScript/TSX files       |

---

## Testing

The backend includes unit tests written with Jest and Supertest, covering:

- **Auth routes** -- Registration and login flows
- **Profile routes** -- Profile update operations
- **Discovery routes** -- User discovery and filtering
- **Matches routes** -- Match creation, acceptance, rejection, and edge cases

Run the test suite from the `backend/` directory:

```bash
npm test
```

Test results are output to `test-results/junit.xml` via the jest-junit reporter.

---

## Tech Stack Summary

| Area       | Technologies                                                        |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 18, Vite 6, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | Express 5, Prisma 7, MariaDB, TypeScript, JWT, bcrypt               |
| Testing    | Jest, ts-jest, Supertest, jest-junit                                 |
| Tooling    | Nodemon, ts-node, PostCSS, ESLint                                   |



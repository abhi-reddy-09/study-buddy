# StudyBuddy

> **Find Your Perfect Study Partner** — A full-stack web application that connects university students for collaborative study sessions, knowledge sharing, and peer support.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## Features

- **Discovery** — Browse and search for study partners based on shared courses and interests
- **Matching** — Send and manage match requests with compatible study buddies
- **Messaging** — Real-time chat with matched partners through a dedicated chat interface
- **Profiles** — Create and manage student profiles with major, bio, and study habits
- **Authentication** — User registration and login system with protected routes
- **Dark Mode** — Toggle between light and dark themes with persistent preference
- **Responsive** — Fully responsive design optimized for desktop and mobile
- **Animations** — Smooth page transitions and micro-interactions powered by Framer Motion

---

## Architecture

This is a **monorepo** containing three packages:

```
study-buddy/
├── backend/          # Express API server + Prisma ORM
├── frontend/         # React SPA (Vite)
└── shared/           # Shared TypeScript types (WIP)
```

### Backend

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Runtime      | Node.js + TypeScript            |
| Framework    | Express 5                       |
| ORM          | Prisma 7 (with MariaDB adapter) |
| Database     | MariaDB / MySQL                 |
| Dev Server   | Nodemon + ts-node               |

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

##  Database Schema

The app uses four core models managed by Prisma:

```
User ──┬── Profile       (1:1)
       ├── Match          (many, as initiator or receiver)
       └── Message        (many, as sender or receiver)
```

| Model     | Key Fields                                                    |
| --------- | ------------------------------------------------------------- |
| `User`    | `id`, `email`, `password`, `createdAt`                        |
| `Profile` | `firstName`, `lastName`, `major`, `bio`, `studyHabits`        |
| `Match`   | `initiatorId`, `receiverId`, `status` (PENDING by default)    |
| `Message` | `senderId`, `receiverId`, `content`                           |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
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

Create a `.env` file in the `backend/` directory:

```env

DATABASE_URL=mysql://your_db_user:your_db_password@localhost:3306/<db_name>

# Server
PORT=3001
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

The API will be available at **`http://localhost:3001`**.

### 3. Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **`http://localhost:5173`**.

---

## Available Scripts

### Backend (`/backend`)

| Script           | Command                    | Description                          |
| ---------------- | -------------------------- | ------------------------------------ |
| `npm run dev`    | `nodemon src/server.ts`    | Start the dev server with hot-reload |
| `npm run db:generate` | `npx prisma generate` | Generate Prisma client               |
| `npm run db:migrate`  | `npx prisma migrate dev` | Run database migrations             |
| `npm run db:studio`   | `npx prisma studio`     | Open Prisma Studio GUI              |
| `npm run db:push`     | `npx prisma db push`    | Push schema changes without migration |

### Frontend (`/frontend`)

| Script            | Command          | Description                     |
| ----------------- | ---------------- | ------------------------------- |
| `npm run dev`     | `vite`           | Start Vite dev server           |
| `npm run build`   | `vite build`     | Build for production            |
| `npm run preview` | `vite preview`   | Preview production build        |
| `npm run lint`    | `eslint`         | Lint TypeScript/TSX files       |

---

## Frontend Routes

| Route                | Page           | Description                     |
| -------------------- | -------------- | ------------------------------- |
| `/`                  | Discovery      | Browse and discover study partners |
| `/matches`           | Matches        | View and manage match requests  |
| `/messages`          | Messages       | Conversations list              |
| `/messages/:chatId`  | Chat           | Individual chat thread          |
| `/profile`           | Profile        | View and edit your profile      |

---

## Tech Stack Summary

```
Frontend:  React 18 · Vite 6 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion
Backend:   Express 5 · Prisma 7 · MariaDB · TypeScript
Tooling:   Nodemon · ts-node · PostCSS · ESLint
```

---

## License

ISC

---

<p align="center">
  Built with ❤️ for students, by students.
</p>

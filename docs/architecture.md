# Architecture

This is a **monorepo** with three directories:

- **backend/** -- Express API server with Prisma ORM and MariaDB
- **frontend/** -- React single-page application built with Vite
- **bugs/** -- Bug tracking and known issues
- **shared/** -- Shared TypeScript types (work in progress)

## Backend

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

## Frontend

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

## Tech Stack Summary

| Area       | Technologies                                                        |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 18, Vite 6, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | Express 5, Prisma 7, MariaDB, TypeScript, JWT, bcrypt               |
| Tooling    | Nodemon, ts-node, PostCSS, ESLint                                   |

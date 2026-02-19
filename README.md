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

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
- [API Endpoints](docs/api.md)
- [Frontend Routes](docs/frontend.md)
- [Configuration & Environment Variables](docs/configuration.md)
- [Deployment & Getting Started](docs/deployment.md)
- [Available Scripts](docs/scripts.md)
- [Testing](docs/testing.md)

---

## Getting Started

For full setup instructions, including backend and frontend configuration, please refer to the [Deployment Guide](docs/deployment.md).

### Quick Start

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sudo-Harshk/study-buddy.git
    cd study-buddy
    ```

2.  **Setup Backend**
    See [Deployment Guide](docs/deployment.md#2-setup-the-backend) for details on `.env` setup and database migrations.

3.  **Setup Frontend**
    See [Deployment Guide](docs/deployment.md#3-setup-the-frontend) for details.

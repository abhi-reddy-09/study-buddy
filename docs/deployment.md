# Deployment

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

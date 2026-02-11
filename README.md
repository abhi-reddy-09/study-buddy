# Study Buddy

## Description
A modern web application designed to connect students for collaborative study sessions, knowledge sharing, and peer support. Built with React, Vite, and Tailwind CSS, it offers features like discovery, matching, messaging, and user profiles.

## Features
- User Authentication: Secure user registration, login, and session management using a Flask backend.
- Real-time Messaging: Instant message exchange between matched users via WebSockets.
- Discovery: Dynamically find other students based on study interests from the backend.
- Matching: Dynamically connect with compatible study partners from the backend.
- User Profiles: Dynamically manage and view student profiles with fetched images.
- Responsive Design: Optimized for various screen sizes (implied by `use-mobile` hook and general good practice).
- Dark Mode: Toggle between light and dark themes.
- Interactive UI: Utilizing `framer-motion` for animations and `shadcn/ui` (Radix UI) for accessible components.

## Technologies Used
- React.js
- Vite
- TypeScript
- Tailwind CSS
- Shadcn/ui (Built on Radix UI)
- React Router DOM
- Framer Motion
- React Hook Form & Zod (for form validation)
- Next Themes (for theme management)
- Lucide React (for icons)
- Sonner (for toasts)
- Recharts (for charts - although no specific chart page is identified, the dependency implies its usage)
- Flask (Python Web Framework)
- Flask-SQLAlchemy (ORM for database interactions with SQLite)
- Flask-Login (User session management for Flask)
- Flask-SocketIO (Real-time communication with WebSockets)
- SQLite (Lightweight database)
- socket.io-client (Frontend WebSocket client)

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/study-buddy.git
    cd study-buddy
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Backend Setup and Usage

The backend is built with Flask and provides authentication and real-time messaging capabilities.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install Python dependencies (if not already done):**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  **Run the Flask backend:**
    ```bash
    .\venv\Scripts\activate
    python app.py
    ```
    The backend API will be available at `http://localhost:5000` (or another port if 5000 is in use), and the SocketIO server will also run on this port. Make sure to keep the backend running for the frontend to communicate with it.

## Usage

1.  **Start the Backend**: Ensure the Flask backend is running (as per "Backend Setup and Usage" section).
2.  **Access the Application**: Open your browser to `http://localhost:5173`.
3.  **Register/Login**: You will be redirected to the login page. Register a new account or log in with existing credentials.
4.  **Explore**:
    - Navigate through the application using the navbar.
    - Use the Discovery page to find potential study partners (data fetched dynamically).
    - Connect with matches on the Matches page (data fetched dynamically).
    - Use the Messages page and Chat page to communicate in real-time with matched buddies.
    - Update your profile on the Profile page (data fetched dynamically).

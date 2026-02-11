# Study Buddy

## Description
A modern web application designed to connect students for collaborative study sessions, knowledge sharing, and peer support. Built with React, Vite, and Tailwind CSS, it offers features like discovery, matching, messaging, and user profiles.

## Features
- User Authentication (Implicit - assuming based on profile/messages)
- Discovery: Find other students based on study interests.
- Matching: Connect with compatible study partners.
- Messaging: Communicate with matched study buddies, including a dedicated chat page.
- User Profiles: Manage and view student profiles.
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

## Usage
- Navigate through the application using the navbar.
- Use the Discovery page to find potential study partners.
- Connect with matches and use the Messages page to communicate.
- Update your profile on the Profile page.

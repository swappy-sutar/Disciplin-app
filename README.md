# 🎯 Disciplin

> **focus. consistency. growth.**
> 
> A premium, modern personal productivity dashboard and job application tracking system designed to streamline your daily routines, habits, goals, learning path, and career search.

## 🚀 Overview

**Disciplin** is a full-stack, typescript-based web application tailored for developers, students, and professionals seeking structure and growth. It combines a daily schedule planner, a robust habit builder with streak mechanics, a weekly goal tracker, a structured study topic manager, and a comprehensive job search dashboard.

A key highlight of the application is its **hybrid data engine**: the frontend automatically detects if the backend API is online and boots into live server mode. If the backend is offline, it gracefully falls back to an interactive, fully functional in-browser Mock database powered by `localStorage`—allowing instant, zero-setup evaluation!

---

## 🛠️ Architecture & Tech Stack

The workspace is organized as a monorepo containing two main packages:

```
Disciplin-app/
├── Backend/      # Node.js + Express API server (TypeScript)
└── frontend/     # React 19 + Tailwind CSS 4 + Vite app (TypeScript)
```

### 🔹 Backend
- **Core Runtime & Language:** Node.js, TypeScript, Express
- **Database:** MongoDB (via Mongoose ODM)
- **Security & Auth:** JSON Web Tokens (Access + Refresh token rotation), bcryptjs, HTTP-only Cookies, Helmet, Rate Limiter
- **Data Validation:** Zod
- **Testing:** Vitest, Supertest
- **Email Notifications:** Nodemailer (with SMTP integration for verification and password reset links)

### 🔹 Frontend
- **Framework & Build Tool:** React 19, Vite, TypeScript
- **Styling & UI:** Tailwind CSS 4.0, Framer Motion (micro-animations & transitions), Lucide Icons, Canvas Confetti
- **State Management:** Zustand (for global client auth & config states)
- **Data Fetching:** TanStack React Query (for server state synchronization and caching)
- **Forms & Validation:** React Hook Form, Zod
- **Analytics & Charts:** Recharts (interactive dashboards for job statistics)
- **Linter:** Oxlint (high-performance linting)

---

## ✨ Key Features

1. **🔒 Secure Authentication Flow**
   - User registration with email verification and password reset workflows.
   - JWT-based auth utilizing short-lived access tokens and secure, HTTP-only refresh tokens.
   
2. **📅 Daily Timetable & Schedule Planner**
   - Hourly schedule block creation, task completion check-offs, and daily progress analytics.

3. **🔥 Streak-Based Habit Tracker**
   - Track habits with streak calculations (current/longest streaks).
   - Interactive calendar heatmaps/grid logging to build daily consistency.

4. **🎯 Weekly Goal Manager**
   - Goal setting and target management on a week-by-week basis with custom due dates.

5. **📈 Job Application Board**
   - End-to-end application lifecycle tracking (Applied, Online Assessment, Interview, Offer, Rejected).
   - Visual distribution charts (via Recharts) and tracking notes for interviews.

6. **📚 Curriculum & Study Topics Tracker**
   - Category-wise learning topics with modular sub-topic check-offs and percentage-based completion trackers.

7. **✉️ Daily Motivational Quotes**
   - Curated quotes displayed daily, with ability to custom-add quotes or toggle favorites.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI if running the Backend)

### Setup & Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/Disciplin-app.git
   cd Disciplin-app
   ```

2. **Frontend Setup (Runs standalone in Mock Mode out of the box!):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The client will start at `http://localhost:5173` (or check terminal output) in offline/localStorage mode. You can log in using `user@momentum.com` with any password.*

3. **Backend Setup (Optional - for persistent cloud storage):**
   - Open a separate terminal.
   ```bash
   cd Backend
   npm install
   # Copy the example environment file and configure variables:
   cp .env.example .env
   # Start the Express server in development mode:
   npm run dev
   ```
   *The backend will boot up on port `5000`. The frontend will automatically detect this and switch from Mock Mode to Live API Server Mode.*

---

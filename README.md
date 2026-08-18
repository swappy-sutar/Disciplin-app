<div align="center">

# 🎯 DISCIPLIN
### *The Ultimate AI-Powered Life Operating System & Peak Performance Cockpit*

<p align="center">
  <strong>⚡ Focus. 🔥 Consistency. 🚀 Exponential Growth.</strong>
</p>

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />

[Explore Features](#-core-pillars--features) • [System Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [API Documentation](#-restful-api-reference) • [Chrome Extension](#-chrome-extension)

</div>

---

## 🌟 Executive Overview

**Disciplin** is an intelligent, unified personal productivity platform engineered for developers, high-performing students, athletes, and career professionals. It replaces fragmented apps by integrating daily timeblocking, gamified habit tracking, weekly milestones, interview preparation pipelines, full athletic workout logging with yearly activity heatmaps, and a deep **Google Gemini AI intelligence suite** into a seamless, high-performance cockpit.

### 🪄 The Hybrid Data Engine (Zero-Setup Evaluation)
Disciplin features an automatic **Hybrid State Engine**:
- **🟢 Live Server Mode:** When the Node.js / Express backend is online, the frontend communicates with the REST API and MongoDB cluster with full JWT authentication, session syncing, and cloud persistence.
- **⚡ Offline Mock Mode:** If the backend server is offline or disconnected, the frontend automatically falls back to an interactive in-browser mock database powered by `localStorage`—enabling instant, zero-friction trial and offline accessibility!

---

## 📐 System Architecture

```
Disciplin-app/
├── ⚙️ Backend/                 # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/            # Database & AI engine configuration
│   │   ├── controllers/       # Business logic (AI, Auth, Workouts, Habits, Jobs)
│   │   ├── middleware/        # JWT verification, Zod request validator, Rate limiter
│   │   ├── models/            # Mongoose Schemas (User, WorkoutSession, Habit, Goal)
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Gemini AI client, Email dispatch, Token manager
│   │   └── utils/             # Helper functions & custom error handlers
│   └── tests/                 # Vitest & Supertest automated API suites
│
├── 💻 frontend/                # React 19 + TypeScript + Vite Single-Page Application
│   ├── src/
│   │   ├── app/               # Root layouts, Zustand global store, routing
│   │   ├── components/ui/     # Design system (WorkoutHeatmap, CalendarPicker, StatCards, Modals)
│   │   ├── features/          # Domain modules (workout, habits, career, timetable, curriculum)
│   │   ├── hooks/             # TanStack React Query hooks, AI adapters, debounce
│   │   ├── lib/               # API client, Mock database fallback, HTTP interceptors
│   │   └── utils/             # Date formatters, image compressors, analytics
│   └── public/                # Static assets, PWA manifest, and icons
│
└── 🧩 chrome-extension/        # Manifest V3 Quick-Access Companion Extension
    ├── popup/                 # Cockpit interface, habit check-off widget, timetable cards
    └── background/            # Service worker & background sync listeners
```

---

## ✨ Core Pillars & Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🧠 1. AI Intelligence Suite</h3>
      <p>Powered by <strong>Google Gemini API</strong> with structured JSON extraction and streaming:</p>
      <ul>
        <li>📄 <strong>AI Cover Letter Generator:</strong> Crafts role-tailored, impactful cover letters from job descriptions.</li>
        <li>🎯 <strong>AI Resume Bullet Architect:</strong> Extracts job requirements to generate quantifiable, ATS-friendly resume bullets.</li>
        <li>🗺️ <strong>AI Curriculum Generator:</strong> Builds modular, multi-week study roadmaps for any technical discipline.</li>
        <li>🏋️ <strong>AI Workout & Split Planner:</strong> Designs custom training splits and automated session logs.</li>
        <li>🔍 <strong>Plateau & Deload Scanner:</strong> Scans multi-week volume trends to detect muscular plateaus.</li>
        <li>💬 <strong>AI Fitness Coach Chat:</strong> Interactive chatbot for exercise cues, form advice, and nutrition tips.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🏋️ 2. Workout & Athletic Consistency Hub</h3>
      <p>Comprehensive resistance training and fitness tracking engine:</p>
      <ul>
        <li>🟩 <strong>52-Week Activity Heatmap:</strong> GitHub-style yearly contribution grid with multi-tier intensity scaling, month headers, and day inspection.</li>
        <li>📈 <strong>Volume & Frequency Analytics:</strong> Recharts area charts for total lifted volume (kg) and multi-gradient muscle distribution bars.</li>
        <li>🔥 <strong>Live Streak Counter:</strong> Real-time current streak, best streak, and period volume metrics.</li>
        <li>📚 <strong>Exercise Library:</strong> Searchable repository with equipment filters and instructional video guides.</li>
        <li>⚡ <strong>Custom Splits:</strong> Push-Pull-Legs, Upper-Lower, Arnold Split, or Custom week maps.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💼 3. Career & Job Application Pipeline</h3>
      <p>End-to-end recruitment management dashboard:</p>
      <ul>
        <li>📊 <strong>Kanban & Funnel Tracking:</strong> Track applications through <em>Applied, Assessment, Interview, Offer, and Rejected</em>.</li>
        <li>📈 <strong>Conversion Analytics:</strong> Visual conversion funnel, salary benchmarking, and application velocity stats.</li>
        <li>💻 <strong>Coding & QA Prep Log:</strong> Track solved algorithms, interview notes, questions asked, and follow-ups.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🔥 4. Habit Builder & Daily Timetable</h3>
      <p>Gamified discipline and time-blocking tools:</p>
      <ul>
        <li>⏰ <strong>Hourly Timeblocking:</strong> Interactive daily schedule blocks with real-time completion progress rings.</li>
        <li>🏆 <strong>Habit Streaks & Confetti:</strong> Automatic streak calculation with celebration confetti triggers upon goal completion.</li>
        <li>📅 <strong>Integrated Calendar Navigator:</strong> Centered custom date picker with Monday week starts, quick jumps, and Sunday highlights.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS 4.0, Glassmorphism, CSS Variables |
| **State Management** | Zustand (Auth, Global UI, Mock Data Storage) |
| **Server Synchronization** | TanStack React Query v5 (Optimistic updates & cache invalidation) |
| **Visualizations** | Recharts (Area charts, Bar distributions, Dynamic Heatmaps) |
| **Animations & Effects** | Framer Motion, Canvas Confetti, Lucide React Icons |
| **Backend Runtime** | Node.js (v18+), Express, TypeScript |
| **Database & ODM** | MongoDB, Mongoose |
| **AI Integration** | Google Gemini API (Streaming, Structured JSON Schema) |
| **Security & Authentication** | JSON Web Tokens (Access + HTTP-only Refresh Tokens), bcryptjs, Helmet, Express Rate Limit |
| **Testing** | Vitest, Supertest, React Testing Library |
| **Browser Extension** | Chrome Extensions Manifest V3 |

---

## ⚡ Quick Start

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Google Gemini API Key *(Optional, required for AI features)*

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/swappy-sutar/Disciplin-app.git
cd Disciplin-app
```

---

### 2️⃣ Run the Frontend (Instant Standalone Mock Mode) 🪄
You can run and test the frontend immediately without setting up MongoDB or the backend:

```bash
cd frontend
npm install
npm run dev
```
> 🌐 The app will boot at `http://localhost:5173`. When the backend is offline, the client seamlessly runs in **Mock Database Mode** using `localStorage`!

---

### 3️⃣ Run the Backend (Live Server Mode) 🚀

In a separate terminal:

```bash
cd Backend
npm install
cp .env.example .env
```

#### Configure `.env` in `/Backend`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/disciplin
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Launch Backend Server:
```bash
npm run dev
```
> 🚀 The API starts at `http://localhost:5000`. The frontend will automatically detect the server and switch from Mock Mode to Live Database Mode!

---

### 4️⃣ Install Chrome Extension Companion 🧩
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `/chrome-extension` directory from this repo.
4. Pin the **Disciplin Cockpit** extension to your browser toolbar!

---

## 📡 RESTful API Reference

All backend API routes are prefixed with `/api`.

<details>
<summary><strong>🔐 Authentication (<code>/api/auth</code>)</strong></summary>
<br>

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate with email & password | ❌ No |
| `POST` | `/api/auth/google` | Authenticate via Google OAuth SSO | ❌ No |
| `POST` | `/api/auth/refresh-token`| Rotate & refresh expired access token | 🍪 Cookie |
| `POST` | `/api/auth/logout` | Clear refresh token & destroy session | ✅ Yes |
| `POST` | `/api/auth/forgot-password`| Send password reset email | ❌ No |
| `POST` | `/api/auth/reset-password` | Reset password using reset token | ❌ No |
| `GET`  | `/api/auth/me` | Fetch authenticated user profile | ✅ Yes |
| `PATCH`| `/api/auth/update-profile`| Update profile display name & settings | ✅ Yes |

</details>

<details>
<summary><strong>🧠 AI Intelligence (<code>/api/ai</code>)</strong></summary>
<br>

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/cover-letter` | Generate targeted cover letter | ✅ Yes |
| `POST` | `/api/ai/resume-bullets` | Generate quantified ATS resume bullets | ✅ Yes |
| `POST` | `/api/ai/study-plan` | Generate structured curriculum roadmap | ✅ Yes |
| `POST` | `/api/ai/workout-split` | Generate customized workout split | ✅ Yes |
| `POST` | `/api/ai/workout-session`| Generate structured single-day workout | ✅ Yes |
| `POST` | `/api/ai/parse-workout-log`| Natural language text-to-workout parser | ✅ Yes |
| `GET`  | `/api/ai/workout-plateau-check`| Progressive volume scan for plateaus | ✅ Yes |
| `POST` | `/api/ai/coach-chat` | Interactive AI fitness & habit coach chat | ✅ Yes |
| `POST` | `/api/ai/goal-program` | Generate goal milestone achievement plan | ✅ Yes |

</details>

<details>
<summary><strong>🏋️ Workouts & Athletic Logging (<code>/api/workouts</code>)</strong></summary>
<br>

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/workouts/sessions` | Fetch workout session history (180/365 days) | ✅ Yes |
| `GET`  | `/api/workouts/today` | Fetch session for specified date | ✅ Yes |
| `POST` | `/api/workouts/sessions` | Save / log workout session with set volume | ✅ Yes |
| `GET`  | `/api/workouts/streak` | Fetch current & longest workout streaks | ✅ Yes |
| `GET`  | `/api/workouts/split` | Fetch user weekly workout split configuration | ✅ Yes |
| `PUT`  | `/api/workouts/split` | Update weekly split mapping | ✅ Yes |
| `GET`  | `/api/workouts/exercises` | List exercise library catalogue | ✅ Yes |

</details>

<details>
<summary><strong>🔥 Habits, Timetable & Goals</strong></summary>
<br>

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/habits` | List all tracked habits and completion streaks | ✅ Yes |
| `POST` | `/api/habits/:id/toggle` | Toggle habit completion for active date | ✅ Yes |
| `GET`  | `/api/timetable` | Get timeblocked schedule entries for date | ✅ Yes |
| `POST` | `/api/timetable` | Create new timeblock item | ✅ Yes |
| `GET`  | `/api/goals` | List weekly & long-term goals | ✅ Yes |
| `GET`  | `/api/fitness-goals` | List fitness targets (strength, weight, reps) | ✅ Yes |
| `GET`  | `/api/dashboard/summary` | Consolidated dashboard metrics & KPIs | ✅ Yes |

</details>

---

## 🔒 Security & Best Practices

- **Token Security:** Short-lived JWT access tokens stored in memory paired with `httpOnly`, `sameSite: strict`, `secure` refresh cookies.
- **Request Sanitization:** Every API payload is validated against strict **Zod** schemas before execution.
- **Defense in Depth:** Helmet HTTP security headers, CORS origin whitelisting, and rate limiting on sensitive authentication and AI endpoints.
- **Image Compression:** Client-side canvas compression before sending image payloads to AI endpoints to minimize latency and bandwidth.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project (`https://github.com/swappy-sutar/Disciplin-app/fork`)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/swappy-sutar">Swapnil Sutar</a> and contributors.</sub>
  <br>
  <sub>If you find Disciplin helpful, consider giving it a ⭐ star!</sub>
</div>

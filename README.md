# 🎯 Disciplin

> **⚡ focus. 🔥 consistency. 🚀 growth.**
> 
> A premium, full-stack personal productivity dashboard, AI-powered career assistant, habit builder, and learning curriculum management platform.

---

## 🌟 Overview

**Disciplin** is a modern, TypeScript-based cockpit designed for developers, students, and professionals striving for structure and peak performance. It unifies daily time-blocking schedules, habit tracking with streak heatmaps, weekly & fitness goals, interview & coding preparation, workout planning, and a state-of-the-art **AI intelligence suite** into a single cohesive experience.

✨ **Key Engineering Highlight — Hybrid Data Engine:**
The frontend automatically detects if the backend API is online and boots into live server mode. If the backend is offline, it gracefully falls back to an interactive, fully functional in-browser Mock database powered by `localStorage`—allowing instant, zero-setup evaluation! 🪄

---

## 🛠️ Architecture & Tech Stack

The workspace is organized as a modular monorepo:

```
Disciplin-app/
├── ⚙️ Backend/           # Node.js + Express + TypeScript API Server (MongoDB + Gemini AI)
├── 💻 frontend/          # React 19 + Tailwind CSS 4 + Vite Client (TypeScript + Zustand)
└── 🧩 chrome-extension/  # Manifest V3 Quick-Access Companion Extension
```

### 🔹 ⚙️ Backend
- 🟢 **Core Runtime & Framework:** Node.js, Express, TypeScript
- 🍃 **Database & ODM:** MongoDB via Mongoose
- 🧠 **AI Engine:** Google Gemini API integration (via OpenAI-compatible endpoint with streaming & JSON mode)
- 🔒 **Security & Auth:** JSON Web Tokens (Access + Refresh token rotation), bcryptjs, HTTP-only Cookies, Helmet, Rate Limiter
- 🛡️ **Data Validation:** Zod schemas on all incoming requests and AI prompts
- ✉️ **Email Notifications:** Nodemailer (SMTP verification & password reset links)
- 🧪 **Testing:** Vitest, Supertest

### 🔹 💻 Frontend
- ⚛️ **Framework & Build:** React 19, Vite, TypeScript
- 🎨 **Styling & Animation:** Tailwind CSS 4.0, Framer Motion (micro-interactions & page transitions), Canvas Confetti, Lucide Icons
- 🐻 **State Management:** Zustand (client auth, UI state, mock database sync)
- 🔄 **Data Fetching & Cache:** TanStack React Query (server-state synchronization, optimistic updates)
- 📝 **Forms & Validation:** React Hook Form, Zod
- 📊 **Data Visualization:** Recharts (interactive dashboards for job analytics, habit trends, and study metrics)
- ⚡ **Linter & Code Quality:** Oxlint

### 🔹 🧩 Chrome Extension Companion
- 📦 **Version:** Manifest V3
- 🚀 **Features:** Quick-action popup, active habit & timetable status cockpit, direct links into Disciplin workspace.

---

## ✨ Key Features

### 🧠 1. AI Intelligence Suite (Powered by Google Gemini)
- 📝 **AI Cover Letter Generator:** Creates role-tailored, high-impact cover letters from job descriptions and your profile.
- 🎯 **AI Resume Bullet Generator:** Extracts key requirements from job postings to craft quantified, ATS-friendly resume bullet points.
- 🗺️ **AI Study Curriculum Architect:** Converts any topic (e.g., *"System Design"* or *"GenAI Engineering"*) into a structured, step-by-step modular curriculum.
- 🏋️‍♂️ **AI Workout & Split Planner:** Builds personalized workout splits, schedules daily sessions, and detects training plateaus.
- ✍️ **AI Natural Language Workout Logger:** Converts free-form text workout descriptions into structured exercise logs.
- 💬 **AI Fitness & Goal Coach Chat:** Interactive assistant for workout adjustments, equipment detection, and fitness goal progress analysis.

### 💼 2. Career & Job Application Board
- 📋 **Full Lifecycle Pipeline:** Track applications across *Applied, Online Assessment, Interview, Offer, Rejected*.
- 📈 **Visual Analytics:** Interactive status distributions, conversion funnel charts, and salary insights via Recharts.
- 💡 **Interview Prep Tracker:** Dedicated modules for tracking coding questions, interview notes, and QA prep.

### 📅 3. Daily Timetable & Schedule Planner
- ⏰ **Timeblocking:** Create and check off hourly schedule blocks throughout your day.
- 📊 **Real-Time Progress:** Dynamic progress rings and completion analytics.

### 🔥 4. Streak-Based Habit Tracker
- 🏆 **Consistency Engine:** Automatic current and longest streak tracking with celebration confetti triggers.
- 🟩 **Calendar Heatmaps:** Visual GitHub-style contribution heatmaps to visualize daily consistency.

### 🎯 5. Goals & Fitness Milestone Manager
- 📌 **Weekly & Long-Term Goals:** Set targets, assign due dates, track sub-tasks, and monitor completion percentages.
- 💪 **Fitness Goals:** Specific metric tracking (weight, reps, endurance) integrated with AI progress assessments.

### 📚 6. Curriculum & Learning Roadmaps
- 🗂️ **Modular Learning:** Group topics by categories with sub-topic check-offs, learning notes, and percentage trackers.
- ⚡ **AI Generation:** Instant zero-to-hero curriculum generation for any topic.

### 🔒 7. Secure Authentication & SSO
- 🔑 **JWT Auth Flow:** Secure access tokens paired with HTTP-only refresh tokens.
- 🌐 **Google Sign-In (SSO):** One-click sign-in via Google Identity Services.
- 🛡️ **Account Security:** Password reset via email OTP/link and email verification workflows.

### 🧩 8. Chrome Extension & Productivity Cockpit
- ⚡ Companion browser extension for one-click habit check-offs, active task viewing, and fast navigation.

---

## 📡 RESTful API Reference

All backend API routes are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | 📝 Register new user account | ❌ No |
| `POST` | `/api/auth/login` | 🔑 Login with email & password | ❌ No |
| `POST` | `/api/auth/google` | 🌐 Authenticate with Google SSO | ❌ No |
| `POST` | `/api/auth/refresh-token` | 🔄 Refresh expired access token | 🍪 No (Cookie) |
| `POST` | `/api/auth/logout` | 🚪 Clear refresh token & session | ✅ Yes |
| `POST` | `/api/auth/forgot-password` | 📧 Send password reset email | ❌ No |
| `POST` | `/api/auth/reset-password` | 🔓 Reset password using token | ❌ No |
| `POST` | `/api/auth/verify-email` | ✉️ Verify email address | ❌ No |
| `GET`  | `/api/auth/me` | 👤 Fetch authenticated user profile | ✅ Yes |
| `PATCH`| `/api/auth/update-profile`| ✏️ Update profile details | ✅ Yes |

### 🤖 AI Intelligence (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/cover-letter` | 📄 Generate tailored cover letter | ✅ Yes |
| `POST` | `/api/ai/resume-bullets` | 🎯 Generate tailored resume bullet points | ✅ Yes |
| `POST` | `/api/ai/study-plan` | 🗺️ Generate modular study curriculum | ✅ Yes |
| `POST` | `/api/ai/workout-split` | 🏋️ Generate custom workout split | ✅ Yes |
| `POST` | `/api/ai/workout-session`| ⏱️ Generate structured workout session | ✅ Yes |
| `GET`  | `/api/ai/workout-insights`| 📊 Get AI workout history analysis | ✅ Yes |
| `POST` | `/api/ai/parse-workout-log`| ✍️ Parse natural language workout log | ✅ Yes |
| `GET`  | `/api/ai/workout-plateau-check`| 🔍 Check plateau status on exercises | ✅ Yes |
| `POST` | `/api/ai/detect-equipment`| 🛠️ Detect exercise equipment requirements | ✅ Yes |
| `POST` | `/api/ai/coach-chat` | 💬 Interactive fitness & habit coach chat | ✅ Yes |
| `POST` | `/api/ai/goal-program` | 🏆 Generate goal achievement program | ✅ Yes |
| `GET`  | `/api/ai/goal-progress` | 📈 Assess progress towards active goals | ✅ Yes |

### 💼 Applications & Career (`/api/applications`, `/api/coding`, `/api/qa`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/applications` | 📂 List user job applications (with filter/sort) | ✅ Yes |
| `POST` | `/api/applications` | ➕ Create new job application entry | ✅ Yes |
| `PATCH`| `/api/applications/:id` | ✏️ Update job application details / status | ✅ Yes |
| `DELETE`| `/api/applications/:id` | 🗑️ Delete job application | ✅ Yes |
| `GET`  | `/api/applications/stats`| 📊 Get application statistics & funnel data | ✅ Yes |
| `PATCH`| `/api/coding/:id` | 💻 Update coding question status/notes | ✅ Yes |
| `DELETE`| `/api/coding/:id` | 🗑️ Delete coding question | ✅ Yes |
| `PATCH`| `/api/qa/:id` | ❓ Update QA interview question | ✅ Yes |
| `DELETE`| `/api/qa/:id` | 🗑️ Delete QA interview question | ✅ Yes |

### 📅 Timetable & Schedule (`/api/timetable`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/timetable` | 📆 Get timetable entries for date | ✅ Yes |
| `POST` | `/api/timetable` | ➕ Add time-block schedule item | ✅ Yes |
| `PATCH`| `/api/timetable/:id` | ✏️ Update timetable entry / completion | ✅ Yes |
| `DELETE`| `/api/timetable/:id` | 🗑️ Delete timetable entry | ✅ Yes |

### 🔥 Habits & Streaks (`/api/habits`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/habits` | 📋 List all tracked habits & streaks | ✅ Yes |
| `POST` | `/api/habits` | ➕ Create new habit | ✅ Yes |
| `PATCH`| `/api/habits/:id` | ✏️ Update habit details | ✅ Yes |
| `POST` | `/api/habits/:id/toggle`| 🔘 Toggle habit completion for date | ✅ Yes |
| `DELETE`| `/api/habits/:id` | 🗑️ Delete habit | ✅ Yes |

### 🎯 Goals & Fitness Goals (`/api/goals`, `/api/fitness-goals`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/goals` | 🎯 List all weekly and milestone goals | ✅ Yes |
| `POST` | `/api/goals` | ➕ Create a new goal | ✅ Yes |
| `PATCH`| `/api/goals/:id` | ✏️ Update goal status or details | ✅ Yes |
| `DELETE`| `/api/goals/:id` | 🗑️ Delete goal | ✅ Yes |
| `GET`  | `/api/fitness-goals` | 💪 List fitness targets | ✅ Yes |
| `POST` | `/api/fitness-goals` | ➕ Create fitness target | ✅ Yes |
| `PATCH`| `/api/fitness-goals/:id`| ✏️ Update fitness target progress | ✅ Yes |
| `DELETE`| `/api/fitness-goals/:id`| 🗑️ Delete fitness target | ✅ Yes |

### 📚 Study Topics & Curricula (`/api/topics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/topics` | 📚 Get all curriculum topics | ✅ Yes |
| `POST` | `/api/topics` | ➕ Create a study topic | ✅ Yes |
| `PATCH`| `/api/topics/:id` | ✏️ Update study topic details | ✅ Yes |
| `DELETE`| `/api/topics/:id` | 🗑️ Delete study topic | ✅ Yes |
| `POST` | `/api/topics/:id/subtopics` | ➕ Add subtopic item | ✅ Yes |
| `PATCH`| `/api/topics/:id/subtopics/:subId` | 🔘 Toggle or update subtopic | ✅ Yes |
| `DELETE`| `/api/topics/:id/subtopics/:subId` | 🗑️ Remove subtopic item | ✅ Yes |

### 🏋️ Workouts (`/api/workouts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/workouts` | 📋 List logged workouts | ✅ Yes |
| `POST` | `/api/workouts` | ➕ Log a completed workout | ✅ Yes |
| `PATCH`| `/api/workouts/:id` | ✏️ Update workout log | ✅ Yes |
| `DELETE`| `/api/workouts/:id` | 🗑️ Delete workout log | ✅ Yes |

### 📊 Dashboard & System (`/api/dashboard`, `/api/notes`, `/api/quotes`, `/api/contact`, `/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET`  | `/api/dashboard/summary` | 📈 Consolidated dashboard KPIs & summary stats | ✅ Yes |
| `GET`  | `/api/notes` / `POST` / `PATCH` / `DELETE` | 📝 Personal markdown note-taking management | ✅ Yes |
| `GET`  | `/api/quotes/daily` | 💬 Get curated daily motivational quote | ❌ No / ✅ Yes |
| `POST` | `/api/contact` | ✉️ Submit contact / support inquiry | ❌ No |
| `GET`  | `/api/notifications` | 🔔 Get user in-app notifications | ✅ Yes |
| `PATCH`| `/api/notifications/:id/read` | 👀 Mark notification as read | ✅ Yes |

---

## ⚡ Quick Start

### 📋 Prerequisites
- 🟢 [Node.js](https://nodejs.org/) (v18+)
- 🍃 [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- 🧠 Google Gemini API Key *(Optional, for AI features)*

### 1️⃣ Clone & Install
```bash
git clone https://github.com/swappy-sutar/Disciplin-app.git
cd Disciplin-app
```

### 2️⃣ Frontend Setup (Works Standalone in Mock Mode! 🪄)
```bash
cd frontend
npm install
npm run dev
```
*The client boots at `http://localhost:5173`. When the backend is offline, the app operates in full offline/Mock Mode using `localStorage`.*

### 3️⃣ Backend Setup (Live Server Mode 🚀)
```bash
cd Backend
npm install
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/disciplin
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Run the backend development server:
```bash
npm run dev
```
*The backend starts at `http://localhost:5000`. The frontend will automatically detect the live server and switch out of Mock Mode.*

### 4️⃣ Chrome Extension Setup 🧩
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `chrome-extension` directory inside this repository.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

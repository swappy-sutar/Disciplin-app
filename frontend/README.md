# 🎨 Disciplin Client (Frontend)

A sleek, responsive, and highly interactive user dashboard interface for Disciplin. Built with React 19, Vite, Tailwind CSS 4.0, and Framer Motion.

---

## 🛠️ Tech Stack

- **Core Framework:** React 19 (utilizing modern rendering features)
- **Bundler & Tooling:** Vite (instant hot module replacement and optimized asset build)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0 (fully custom typography, colors, and layout utilities)
- **Animations:** Framer Motion (fluid page transitions, interactive hover effects, and spring animations)
- **Global State Management:** Zustand (for lightweight, reactive store configurations like JWT keys and theme profiles)
- **Server State Sync:** TanStack React Query (advanced fetching, mutation caching, auto-refetching, and state management)
- **Charts & Analytics:** Recharts (responsive vector charts showing job tracker status distributions)
- **Form Management:** React Hook Form + Zod resolvers
- **Linter:** Oxlint (next-generation linter running 50-100x faster than ESLint)
- **UX Helpers:** Lucide React (vector icon library), Canvas Confetti, React Hot Toast (toast alerts)

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/            # Store (Zustand), global layouts, and core CSS configs
│   ├── assets/         # SVG icons, images, and brand assets
│   ├── components/     # Reusable UI widgets and charting components
│   ├── features/       # Feature-driven module directories:
│   │   ├── auth/          # Login, Register, Password Reset, Email Verification
│   │   ├── overview/      # Dashboard Overview (Timetable list, today's quote, habit logging summary)
│   │   ├── habits/        # Full Habit tracker with streaks and habit logging logs
│   │   ├── goals/         # Weekly Goal checklist planner
│   │   ├── applications/  # Job application cards, stages, notes, and Recharts statistics
│   │   ├── topics/        # Study curriculum syllabus and progress tracks
│   │   ├── profile/       # Profile configuration settings
│   │   └── landing/       # Landing page introduction layout
│   ├── hooks/          # Shared custom hooks
│   ├── lib/            # External library configurations (e.g., apiClient)
│   ├── types/          # Entity interfaces (Timetable, Habit, Goal, Application, User)
│   └── utils/          # Standard datetime helpers and formatter utils
├── index.html          # Shell wrapper
├── vite.config.ts      # Vite compiling parameters
└── tsconfig.json       # Strict TypeScript configuration
```

---

## ⚙️ Hybrid Data Engine (Backend Detection & Mock Fallback)

The frontend client is designed to run with **zero backend setup requirements** out of the box.

Within [api-client.ts](file:///e:/SELF-PROJECTS/Disciplin-app/frontend/src/lib/api-client.ts):
1. On boot, the client performs a silent GET request to `http://localhost:5000/health`.
2. **Backend Online:** If the request responds successfully, the application interacts with the Express Server via REST and cookie-based JWT headers.
3. **Backend Offline:** If the request fails, the application falls back to an interactive **Mock Database** running entirely in your browser's `localStorage`.
   - *A mock user `user@momentum.com` is seeded automatically on fallback.*
   - *All creations, updates, checks, and analytics changes are saved in `localStorage` in real-time, simulating network latency (150ms).*

---

## ⚡ Development & Scripts

From the `frontend/` directory:

```bash
# Install package dependencies
npm install

# Start the Vite local development server
npm run dev

# Run Oxlint to scan files for issues/syntax rules
npm run lint

# Build static assets for production deployment
npm run build

# Preview the built production output locally
npm run preview
```

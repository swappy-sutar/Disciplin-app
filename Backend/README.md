# ⚙️ Disciplin API (Backend)

The Express REST API server for the Disciplin productivity suite, written in TypeScript and backed by MongoDB.

---

## 🛠️ Tech Stack

- **Runtime & Language:** Node.js, TypeScript (typed compilation, safety, and modern features)
- **Framework:** Express.js (routing, middleware, and request/response pipelines)
- **Database:** MongoDB via Mongoose (robust ODM with schema enforcement and custom queries)
- **Validation:** Zod (runtime request schema validations and compiler type inference)
- **Security:**
  - `jsonwebtoken` - Double token (access + refresh) rotation architecture
  - `cookie-parser` - Access/refresh token delivery through secure cookies
  - `bcryptjs` - Strong password hashing
  - `helmet` - Secure HTTP headers
  - `express-rate-limit` - Protection against brute force and DDoS requests
- **Mail Integration:** Nodemailer (SMTP configurations for verification and password reset emails)
- **Testing Framework:** Vitest & Supertest (for fast in-memory integration and controller testing)

---

## 📂 Project Structure

```
Backend/
├── src/
│   ├── config/         # System config, validation environments, and Constants
│   ├── controllers/    # API request handlers/controllers
│   ├── middlewares/    # Custom middlewares (auth validation, error handling, rate limits)
│   ├── models/         # Mongoose DB schema definitions
│   ├── routes/         # Router hierarchies mapping paths to controllers
│   ├── services/       # Core business logic (email delivery, token logic, etc.)
│   ├── types/          # Shared TypeScript type definitions
│   ├── utils/          # Helper classes, custom errors, and utils
│   └── validations/    # Zod schemas validating API requests
├── tests/              # Controller & route integration test suites
├── tsconfig.json       # TypeScript compiler options
└── vitest.config.ts    # Testing pipeline rules
```

---

## 🔑 Configuration & Environment

The backend server relies on a `.env` configuration file in the `Backend/` directory. Use `.env.example` as a baseline:

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/disciplin-app
JWT_SECRET=super_secret_key_change_me_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email SMTP Settings (For password recovery and verification)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_SECURE=false
EMAIL_FROM="Disciplin" <noreply@disciplin.app>
```

---

## 📡 API Endpoints

All application routes are prefixed with `/api/v1`.

### 🔒 Authentication (`/auth`)
- `POST /auth/register` - Create a user account (sends validation email).
- `POST /auth/login` - Authenticate credentials and assign JWT cookies.
- `POST /auth/refresh` - Generate a new access token via the refresh token.
- `POST /auth/logout` - Clear user auth cookies.
- `GET /auth/me` - Fetch profile information of the current authenticated user.
- `PUT /auth/profile` - Update current user profile details (name, password, email).
- `POST /auth/forgot-password` - Request a password reset link email.
- `POST /auth/reset-password` - Reset password using validation token.
- `POST /auth/verify-email` - Confirm registration using validation token.

### 📅 Timetable (`/timetable`)
- `GET /timetable?date=YYYY-MM-DD` - Fetch all timetable blocks for a specific date.
- `POST /timetable` - Create a schedule block.
- `PATCH /timetable/:id` - Update status, label, or time slot of a schedule block.
- `DELETE /timetable/:id` - Remove a schedule block.

### 🔥 Habits (`/habits`)
- `GET /habits` - Retrieve user habits and calculations (streaks, longest/current streak).
- `POST /habits` - Add a new tracked habit (name, color, order).
- `PATCH /habits/:id` - Update active status or name of a habit.
- `DELETE /habits/:id` - Permanently remove a habit.
- `GET /habits/logs?startDate=...&endDate=...` - Get completion records.
- `POST /habits/logs` - Toggle or create a completion log for a habit on a given date.

### 🎯 Weekly Goals (`/goals`)
- `GET /goals?week=YYYY-MM-DD` - Fetch goals for a specific week.
- `POST /goals` - Add a weekly goal.
- `PATCH /goals/:id` - Mark as completed or change title.
- `DELETE /goals/:id` - Delete a weekly goal.
- `GET /goals/history` - Retrieve history of goals.

### 📚 Study Topics (`/topics`)
- `GET /topics` - Retrieve all topics/modules.
- `POST /topics` - Create a topic with optional nested sub-topics.
- `PATCH /topics/:id` - Edit topic structure, check off sub-topics, or recalculate progress.
- `DELETE /topics/:id` - Remove a topic.

### 📈 Job Applications (`/applications`)
- `GET /applications` - List job search records.
- `POST /applications` - Create a new job tracker entry (Company, Role, Link, Status, Notes).
- `PATCH /applications/:id` - Edit application status or details.
- `DELETE /applications/:id` - Delete a job tracking entry.

### 📝 Notes & Q&As (`/notes`, `/qa`, `/coding`)
- Modules to log developer notes, flashcard questions, and coding test logs.

### 📊 Dashboard Summary (`/dashboard`)
- `GET /dashboard/summary?date=YYYY-MM-DD` - Aggregate analytics (daily timetable progress percentage, weekly habit grids, incomplete learning modules, job statistics, daily quote).

---

## ⚡ Development & Scripts

Inside the `Backend/` directory, run:

```bash
# Install dependencies
npm install

# Start the dev server with hot-reloads (via tsx watch)
npm run dev

# Compile TypeScript to JavaScript in the 'dist' directory
npm run build

# Run Node.js production build
npm run start

# Run all test suites
npm run test

# Run tests in watch mode
npm run test:watch
```

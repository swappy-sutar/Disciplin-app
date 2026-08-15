# Product Requirements Document
## AI Feature Integration — Disciplin App (Gemini API)

**Author:** Product/Engineering
**Status:** Draft
**Version:** 1.0
**Date:** August 13, 2026
**Related repo:** `swappy-sutar/Disciplin-app`

---

## 1. Overview

Disciplin is a full-stack productivity dashboard and job-application tracker (React 19 + Vite frontend, Node.js/Express/MongoDB backend). This PRD defines the integration of Google's **Gemini API** (via its OpenAI-compatible endpoint) to add AI-assisted features across the Job Application Board, Curriculum/Study Tracker, and Habit/Schedule modules.

The goal is to make Disciplin feel like an intelligent assistant rather than a static tracker — reducing manual data entry and surfacing insights the user wouldn't otherwise see.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Reduce manual effort in job applications (cover letters, resume bullets)
- Auto-generate structured study curricula from a single topic input
- Surface lightweight, non-intrusive insights on habits and schedules
- Keep the entire integration on a **free API tier** with no ongoing cost
- Preserve the app's existing offline/Mock Mode UX — AI features degrade gracefully when the backend is unavailable

### 2.2 Non-Goals
- Not building a general-purpose chatbot inside the app
- Not replacing manual editing — AI output is always a starting draft, never auto-submitted
- Not handling voice, image, or file-upload-based AI features in this phase
- Not optimizing for scale/production cost controls yet (single-user or low-traffic assumption)

---

## 3. Background & Rationale

| Consideration | Decision |
|---|---|
| Provider | Google Gemini API |
| Why | Indefinite free tier, no credit card required, generous rate limits (15 RPM / 1,000 RPD on Flash-Lite), OpenAI-compatible endpoint |
| Model | `gemini-3.5-flash-lite` (default), swappable via env var |
| SDK | `openai` npm package pointed at Gemini's OpenAI-compatible base URL — keeps code provider-agnostic |
| Cost | $0, as long as billing is never enabled on the Google Cloud project tied to the API key |

**Constraint to respect:** enabling billing on the Google Cloud project removes free-tier access entirely for that project. The project backing this integration must remain billing-disabled indefinitely, or a separate free project must be used if quotas are ever exceeded.

---

## 4. User Personas

- **Job seeker** — actively applying, wants tailored application material fast
- **Self-learner** — wants structured study plans without manually breaking down topics
- **Habit builder** — wants light reflection/insight without extra logging effort

---

## 5. Feature Scope (Phased)

### Phase 1 — Job Application Assistant (P0)

| Feature | Description |
|---|---|
| AI Cover Letter Generator | Given a job description + user profile/resume text, generate a tailored cover letter draft |
| AI Resume Bullet Suggestions | Given a job description + raw experience notes, generate 3–5 tailored resume bullet points |

**User flow:**
1. User opens a Job Application (create or edit)
2. Pastes/has stored a job description
3. Clicks "Generate with AI"
4. Draft streams into an editable textarea
5. User edits and saves; draft is persisted to avoid regenerating on reopen

**Acceptance criteria:**
- Generation completes or streams within 8 seconds under normal conditions
- Failure (rate limit, network, API error) shows a clear inline error, never blocks the rest of the form
- Feature is fully disabled (with explanatory tooltip) when running in Mock Mode / backend offline

---

### Phase 2 — Curriculum / Study Plan Generator (P0)

| Feature | Description |
|---|---|
| AI Study Plan Generator | Given a topic name + skill level, generate a structured list of sub-topics matching the existing curriculum schema |

**User flow:**
1. User creates a new Study Topic
2. Enters topic name (e.g. "System Design") and selects skill level
3. Clicks "Generate curriculum"
4. Sub-topics populate as checklist items (editable, deletable, reorderable — same as manual entry)

**Acceptance criteria:**
- Output returned as structured JSON (via Gemini's structured output / JSON mode), mapped directly onto existing sub-topic schema
- No malformed/partial JSON reaches the frontend — backend validates with Zod before responding
- User can regenerate if unsatisfied (rate-limited to prevent abuse)

---

### Phase 3 — Schedule & Habit Intelligence (P1)

| Feature | Description |
|---|---|
| AI Schedule Suggestions | Free-text intent ("2hrs DSA, 1hr gym, 8hr work") → structured timetable blocks |
| Habit Insight Summary | Weekly natural-language summary of streak/consistency patterns |

**Acceptance criteria:**
- Schedule suggestions respect existing time-block schema and do not overwrite existing entries without confirmation
- Habit insights are generated on-demand or via a weekly scheduled job (not on every page load)

---

### Phase 4 — Polish & Guardrails (P1/P2)

- Per-user daily AI request quota (protect shared free-tier limits)
- Request/response caching for repeated prompts (e.g. same job description)
- Graceful fallback messaging when Gemini free-tier rate limits are hit (429 handling with retry/backoff)
- Token/usage logging for observability (even though cost is $0, quota exhaustion is a real risk)

---

## 6. Technical Design

### 6.1 Architecture

```
frontend/                          Backend/
  React Query mutation    --->       POST /api/ai/*  (new routes)
  "Generate with AI" UI              ai.controller.ts
                                      ai.service.ts  (Gemini wrapper via OpenAI SDK)
                                      Zod validation on all AI inputs/outputs
                                      Dedicated rate limiter (separate from auth limiter)
```

### 6.2 New Backend Components

| File | Purpose |
|---|---|
| `src/services/ai.service.ts` | Single wrapper around the OpenAI SDK, base URL pointed at Gemini's compatible endpoint. Handles retries, timeouts, error normalization. |
| `src/routes/ai.routes.ts` | `/api/ai/cover-letter`, `/api/ai/resume-bullets`, `/api/ai/study-plan`, `/api/ai/schedule-suggest`, `/api/ai/habit-insight` |
| `src/controllers/ai.controller.ts` | Request validation (Zod), calls service, shapes response |
| `src/middleware/aiRateLimiter.ts` | Separate, stricter rate limit than auth routes |

### 6.3 Environment Variables

```
GEMINI_API_KEY=xxxxx
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_MODEL=gemini-3.5-flash-lite
```

Never exposed to frontend — all Gemini calls happen server-side only.

### 6.4 Frontend Components

- New React Query mutation hooks: `useGenerateCoverLetter`, `useGenerateStudyPlan`, etc.
- "Generate with AI" buttons in relevant forms (Job Application modal, Study Topic modal)
- Loading/streaming states consistent with existing Framer Motion transition patterns
- Disabled state + tooltip when `backendOnline === false` (reusing existing hybrid data engine detection)

### 6.5 Data Model Changes

| Collection | Change |
|---|---|
| `JobApplication` | Add optional fields: `aiCoverLetter: string`, `aiResumeBullets: string[]` |
| `StudyTopic` | No schema change — AI-generated sub-topics map to existing sub-topic array |
| `User` (optional, Phase 4) | Add `aiRequestCount`, `aiRequestResetAt` for quota tracking |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Cost** | Must remain $0 — billing must never be enabled on the backing Google Cloud project |
| **Latency** | AI responses should begin streaming/returning within 3–5s; hard timeout at 15s |
| **Reliability** | AI feature failure must never break core CRUD flows (applications, habits, etc. always usable without AI) |
| **Privacy** | Free-tier Gemini usage may be used by Google to improve their models — this must be disclosed in-app (e.g. small note near AI features) since resumes/job data may be sensitive |
| **Security** | API key stored server-side only, never in frontend bundle or client-visible env |
| **Rate limits** | Respect Gemini free tier: ~15 RPM, ~1,000 RPD on Flash-Lite; implement exponential backoff on 429 |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Free-tier rate limits hit during normal use | Per-user quota + clear UI messaging + backoff/retry |
| Google changes/reduces free-tier limits without notice (has happened before, per Dec 2025 quota cuts) | Abstract Gemini behind a provider-agnostic service layer so switching providers is a config change, not a rewrite |
| Sensitive data (resumes, job descriptions) sent to a free-tier model that may retain data for training | Disclose in UI; consider Vertex AI or paid tier if privacy becomes a concern |
| Malformed AI output breaks UI (bad JSON for study plans) | Zod validation on all AI responses before they reach the frontend; reject and retry once on validation failure |
| Enabling billing accidentally kills free tier | Document clearly in `.env.example` and README; use a dedicated Cloud project reserved only for this API key |

---

## 9. Success Metrics

- % of job applications created using AI-generated cover letter/bullets
- % of study topics created using AI-generated curriculum vs. manual entry
- AI feature error rate (target: <2% of requests fail after retry)
- Zero unexpected billing events

---

## 10. Open Questions

- Should AI-generated content be visually marked as "AI-generated" in the UI for transparency?
- Should users be able to opt out of AI features entirely (privacy-conscious users)?
- Do we want a global daily cap shared across all users, or per-user caps, given the free tier is shared at the project level?

---

## 11. Rollout Plan

1. Phase 1 behind a feature flag / env toggle (`AI_FEATURES_ENABLED`)
2. Ship Phase 1 (Job Application Assistant) to production first, monitor quota usage for 1–2 weeks
3. Ship Phase 2 (Study Plan Generator) once Phase 1 quota patterns are understood
4. Phase 3 features shipped only if free-tier headroom allows
5. Phase 4 guardrails implemented before any further feature expansion

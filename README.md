
## 🗂 Project Structure

```

project-root/
├── backend/        # Express + MongoDB backend
│   └── src/        # Backend source code
├── frontend/       # React (Vite) frontend
│   └── src/        # Frontend source code
└── README.md

````

# How to run the project (as of now) 🦦

## 🛠️ First-Time Setup

Clone the repo:
```bash
git clone https://github.com/your-username/ai-quiz-app.git
cd ai-quiz-app
````

### 1. Backend setup

```bash
cd backend
npm install
```

Start the backend in dev mode:

```bash
npm run dev
```

By default, backend runs on:
👉 [http://localhost:4000](http://localhost:4000)

---

### 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

Vite will show the local dev URL (usually [http://localhost:5173](http://localhost:5173)).

---

## Running After Setup

Each time you want to run the project:

1. Start the backend:

   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend (in a new terminal):

   ```bash
   cd frontend
   npm run dev
   ```
3. Open the frontend URL from Vite’s output in your browser.


---

# Phase 1 — Core Quiz App (Authentication, Quiz CRUD, Confidence Scoring, Attempts & Results)

## Overview goals

* Teacher: register/login, create/edit/delete quizzes (with start/end time + pin), view per-student results.
* Student: register/login (or quick join via quiz code+pin / link), take quiz question-by-question (with confidence 0–100), submit; see instant results.
* Scoring: confidence-weighted scoring (configurable).

---

## High-level modules (server)

* **auth**: registration, login, JWT, role middleware
* **users**: teacher/student profile CRUD
* **quizzes**: create/edit/delete/get, publish/unpublish, scheduling, pin
* **questions**: included within quizzes (embedded or sub-doc)
* **attempts**: records of student quiz attempts (answers, confidences, events)
* **results**: aggregated endpoints (per quiz, per student) for teacher views
* **utils**: scoring logic, validation, time utilities
* **notifications/email** (optional): send quiz link or results
* **staticfiles**: host client build in production

---

## MongoDB schemas (Mongoose) — main collections

### User

```js
{
  _id: ObjectId,
  email: {type: String, unique: true},
  passwordHash: String,
  role: { type: String, enum: ['teacher','student'] },
  name: String,
  studentId: String, // optional for students
  createdAt: Date,
  meta: { avatarUrl, bio }
}
```

### Quiz

```js
{
  _id: ObjectId,
  teacherId: ObjectId,
  title: String,
  description: String,
  questions: [
    {
      _id: ObjectId,
      type: {type: String, enum: ['mcq','short','numeric']},
      prompt: String, // support LaTeX markup inline
      options: [{ id: String, text: String }], // for mcq
      correctAnswer: String|Number|Array, // internal; do NOT send to students
      points: Number, // base points (optional)
      allowLateSubmission: Boolean
    }
  ],
  quizCode: String, // 6-8 char human code
  pin: String, // hashed
  startAt: Date,
  endAt: Date,
  published: Boolean,
  createdAt: Date,
  settings: {
    scoringMode: { type: String, enum: ['confidence_absolute','confidence_scaled','binary'] , default: 'confidence_absolute' },
    negativeForWrong: Boolean, // whether wrong subtracts
    maxConfidencePoints: Number // optional cap
  }
}
```

### Attempt

```js
{
  _id: ObjectId,
  quizId: ObjectId,
  studentId: ObjectId,
  startedAt: Date,
  submittedAt: Date,
  answers: [
    {
      questionId: ObjectId,
      selectedOptionId: String | null,
      typedAnswer: String | null,
      confidence: Number, // 0-100
      correct: Boolean,
      questionPointsAwarded: Number,
      events: [ /* for phase2: blur, tab-switch, idle */ ]
    }
  ],
  score: Number,
  maxPossibleScore: Number,
  status: { type: String, enum: ['in_progress','submitted','graded'] },
  suspiciousEventsCount: Number, // phase2
  meta: { userAgent, ipHash }
}
```

---

## API design — REST endpoints (example)

Use `/api/v1/...`

### Auth

* `POST /api/v1/auth/register` `{ name, email, password, role, studentId? }` → returns JWT
* `POST /api/v1/auth/login` `{ email, password }` → JWT
* `GET /api/v1/auth/me` → user profile (JWT)

### Users

* `GET /api/v1/users/:id` (teacher-only to view student profile)
* `PUT /api/v1/users/:id` update profile

### Quizzes

* `POST /api/v1/quizzes` (teacher) — create quiz. Payload includes questions array. Validate LaTeX allowed in prompt/options.
* `PUT /api/v1/quizzes/:id` (teacher) — edit (can't edit if active and has attempts unless teacher allows)
* `DELETE /api/v1/quizzes/:id` (teacher)
* `GET /api/v1/quizzes` (teacher: all by teacher; student: published live ones)

  * Query params: `teacherId`, `published`, `activeOnly=true`
* `GET /api/v1/quizzes/:id` (teacher sees full; student receives quiz with correctAnswer removed and only if within start/end)
* `POST /api/v1/quizzes/:id/publish` (teacher) — sets published flag
* `POST /api/v1/quizzes/validate-pin` `{ quizCode, pin }` → validate join

### Attempts

* `POST /api/v1/attempts/start` `{ quizId, studentId }` → create attempt document (status `in_progress`) returns attemptId, server-side timestamp
* `POST /api/v1/attempts/:attemptId/save` — autosave partial answers (optional)
* `POST /api/v1/attempts/:attemptId/answer` `{ questionId, selectedOptionId, typedAnswer, confidence }` — record answer (support single-question posting for progressive submit)
* `POST /api/v1/attempts/:attemptId/submit` → server-side grading (run scoring logic), mark `submittedAt`
* `GET /api/v1/attempts/:attemptId` → student review (only after allowed)
* `GET /api/v1/quizzes/:quizId/attempts` → teacher: list of attempts (with summary)

### Results & export

* `GET /api/v1/quizzes/:quizId/results/summary` → average score, median, distribution, confidence-vs-accuracy stats
* `GET /api/v1/quizzes/:quizId/results/:studentId` → specific student attempt(s)
* `GET /api/v1/quizzes/:quizId/export?format=csv` → CSV of attempts

---

## Scoring engine — core logic (server util)

Place under `utils/scoring.js`

### Default scoring algorithm (configurable):

* For each question:

  * Let `c` = confidence (0–100)
  * If correct:

    * `points = basePoints * (c / 100)` (if basePoints provided), else `points = c` (raw)
    * Optionally scale: `points = (c/100) * maxConfidencePoints`
  * If incorrect:

    * If `settings.negativeForWrong` true: `points = - (c / 100) * penaltyFactor` (penaltyFactor default = basePoints or 1)
    * Else `points = 0`
* `totalScore = sum(points)`; clamp to `[0, maxPossible]` if desired.

**Implementation details**

* Export function `gradeAttempt(quiz, attempt)` that:

  * loads quiz.questions,
  * compares answers (exact match for MCQ; trim/normalize for short answer or numeric with tolerance),
  * computes `correct` boolean and `questionPointsAwarded`,
  * computes overall `score` and `maxPossibleScore`,
  * records per-question breakdown to Attempt document.

---

## Backend middleware & guards

* `authMiddleware` — verifies JWT, injects `req.user`
* `roleMiddleware('teacher')` — restrict routes
* `quizActiveMiddleware` — checks `startAt`/`endAt` and pin validation when necessary
* `rateLimiter` — protect `attempts.start` and auth endpoints
* input sanitization & escaping for LaTeX content (store raw but escape when rendering in UI)

---

## Frontend: routes & components (React)

### Pages / Routes

* `/` → Landing (if logged out)
* `/auth/login`, `/auth/register`
* `/teacher` → Teacher home/dashboard (protected)

  * `/teacher/quizzes` — list of quizzes
  * `/teacher/quizzes/new` — create quiz form
  * `/teacher/quizzes/:id/edit` — edit quiz
  * `/teacher/quizzes/:id` — view quiz details (settings, schedule)
  * `/teacher/quizzes/:id/results` — list attempts + export
  * `/teacher/quizzes/:id/results/:attemptId` — detailed attempt view
* `/student` → Student home

  * `/join` — enter quiz code + pin OR open link flow
  * `/quiz/:quizId/info` — collect name/email/studentId if anonymous join via link
  * `/attempt/:attemptId` — quiz-taking UI (question-by-question)
  * `/attempt/:attemptId/review` — result page (if allowed)
* Shared:

  * `/profile`, `/settings`

### Major React components (atomic)

* `AuthForm`, `ProtectedRoute`, `RoleRoute`
* `TeacherDashboard`, `QuizList`, `QuizCard`
* `QuizForm` — create/edit; dynamic question editor with add/remove/reorder; option to upload images/LaTeX input
* `QuestionEditor` — fields: prompt (rich text textarea with LaTeX support), type selector, options list, correct answer selector
* `QuizDetail` — show schedule, pin, publish button
* `StudentJoin` — join by code or link
* `AttemptContainer` — manages attempt state, timers, autosave
* `QuestionPage` — shows prompt + options, confidence slider/input (0–100), Next/Prev, Save button
* `ConfidenceSlider` component (numeric input + slider)
* `ResultSummary` — per-question breakdown and total score
* `TeacherResultsTable` — paginated table CSV export
* `LatexRenderer` — uses KaTeX or MathJax (render LaTeX client-side)

### State management

* Use **Redux Toolkit** or Context + React Query:

  * slices: `auth`, `teacher.quizzes`, `attempts`, `ui`
  * Use **React Query** for caching quiz & attempt fetches (helps with autosave and optimistic updates)

### UI/UX rules

* Show countdown if quiz has `startAt`/`endAt`
* Prevent answer changes after submission
* Auto-save every X seconds / when changing page
* Warn students if they try to navigate away (before submission): `beforeunload` handler
* Support LaTeX in both question prompt and option text (render with KaTeX)

---

## Security & Data privacy

* Hash quiz PINs (bcrypt)
* Hash passwords (bcrypt) and store password reset tokens
* JWT refresh: short expiry + refresh tokens stored in HttpOnly cookie
* Rate limit login & attempt endpoints
* Sanitize user-submitted text to prevent XSS (allow LaTeX safe subset)
* Never send `correctAnswer` to client for published quizzes until grading wants to reveal

---

## Testing

* Unit tests for scoring logic (Jest): edge cases (100% confidence wrong, 0% confidence correct, etc.)
* Integration tests for API endpoints (supertest)
* E2E tests for quiz flow (Cypress): teacher creates quiz → student joins → student submits → teacher sees result
* Frontend component tests (React Testing Library)

---

# Phase 2 — Focus Detection & Classroom Analytics (Anti-cheat + aggregated analytics)

## Goals

* Detect student leaving focus or switching tabs and log events.
* Penalize attempted cheating per teacher-config.
* Provide teacher classroom analytics: distributions, confidence-vs-accuracy, time-on-question, suspicious flags.

---

## New/changed backend modules

* **focusEvents**: endpoint to accept client events (tab blur, visibility change, window resize, loss of pointer)
* **analytics**: functions to aggregate attempt collections, produce histograms & correlation values
* **websocket** (optional): real-time monitoring for teacher during live quizzes (watch student progress & detect suspicious activity)

---

## Attempt schema additions (see earlier)

Add:

```js
answers[].events = [
  { eventType: 'blur'|'visibilitychange'|'idle'|'focus', timestamp: Date, durationMs?: Number }
]
attempt.suspiciousEventsCount
attempt.timePerQuestion[] // optional
```

---

## Frontend implementation (student quiz page)

* In `AttemptContainer` register these listeners:

  * `document.addEventListener('visibilitychange', handler)` — log when `document.hidden === true`
  * `window.addEventListener('blur', handler)` and `window.addEventListener('focus', handler)`
  * Idle detection using mousemove/keydown/touchstart: if no activity for `IDLE_THRESHOLD` (configurable, e.g., 30s) push `idle` event
  * Track `timeOnQuestion` by measuring entry/exit per `QuestionPage`
* Events are stored in local attempt state and **pushed to backend** periodically (`/api/v1/attempts/:attemptId/events`) or included in `attempt.save`
* On submit: compute `suspiciousEventsCount` and apply configured penalty in `gradeAttempt()` (e.g., subtract 5 points per event or set status `cheated` if > threshold)

### Teacher settings for penalties (Quiz.settings)

```js
settings: {
  focusPenalty: { type: String, enum: ['none','warn','penalizePoints','autoFail'], default: 'warn' },
  penaltyPoints: Number,
  maxAllowedSwitches: Number
}
```

---

## Analytics engine (server)

* New endpoints:

  * `GET /api/v1/quizzes/:quizId/analytics/overview` → avg, median, sd, histogram buckets
  * `GET /api/v1/quizzes/:quizId/analytics/confidence-correlation` → correlation coefficient between confidence and correctness; produce arrays for scatter plot
  * `GET /api/v1/quizzes/:quizId/analytics/question-stats` → per-question difficulty (p% correct), avg confidence
  * `GET /api/v1/quizzes/:quizId/analytics/suspicious` → list of attempts flagged for suspicious activity
* Implementation:

  * Use MongoDB aggregation pipelines for pivots (group/avg/sum), or compute offline in Node for complex stats
  * For correlation: compute Pearson correlation coefficient between confidence and correctness (0/1) for each question or overall.

---

## Frontend teacher dashboard additions

* `TeacherAnalytics` page with:

  * Histogram (score distribution)
  * Scatter plot (confidence on X vs correctness on Y where correctness is 0/1) — show trendline (compute on backend)
  * Per-question table: avg confidence, % correct, flagged attempts count
  * Suspicious attempts list with event detail viewer
* Real-time view:

  * `LiveMonitor` (websocket): teacher can watch live attempt counts, who left the app (red marker), recent events

---

## Additional non-functional & security concerns

* Be careful with background operations: `visibilitychange` can be fired legitimately (e.g., mobile notifications). Provide "grace" threshold.
* Allow teachers to opt-in for strict enforcement. Default to warn only.

---

# Phase 3 — AI Enhancements (Recommendations, Auto Question Generation, Personalized Feedback)

## Goals

* Use AI model(s) for:

  * Generating questions from uploaded materials
  * Generating teacher recommendations (topics to review, suggested exercises)
  * Providing per-student insights (weaknesses, study plan)
* Integrate with an LLM (OpenAI or other). Build clear prompt templates and verification workflows.

---

## New modules

* **aiService**: wrapper for LLM calls, rate-limit & caching, prompt templates
* **uploader**: parse PDF/DOCX/PPTX and extract text
* **qgen**: auto-generate questions (MCQ + distractors + correct answer + difficulty)
* **recommendations**: synthesize analytics into teacher suggestions
* **reviewDrafts**: UI flow where teacher reviews AI-generated questions before saving

---

## Data flow for Q-Generation

1. Teacher uploads file(s) → `/api/v1/upload` (store in S3 or local)
2. Backend extracts text using libraries:

   * PDFs: `pdf-parse`
   * DOCX: `mammoth`
   * PPTX: `pptx2json` or similar
3. Chunk text (by heading/slide/section) and call LLM with prompt:

   * Prompt: "Create 5 multiple choice questions from the following content. For each, produce: prompt, 4 options, index of correct option, difficulty level, tags. Keep numeric values exact where applicable."
4. Post-process: validate syntax, remove hallucinated facts, de-duplicate.
5. Store generated questions in a staging collection: `aiGeneratedQuestions` with `status: 'draft'`.
6. Teacher reviews in UI (`/teacher/ai/drafts`) → edit/save into quiz.

---

## Recommendation engine (teacher insights)

* Input: `quiz analytics`, student performance history, material tags.
* Output: suggestions like:

  * "Focus review on Topic A — 70% of class had confidence > 60% but only 30% correct"
  * "Recommend 10 practice MCQs with emphasis on subtopic X"
  * Confidence-based recommendations: flag students "overconfident" (avg confidence > 75% & accuracy < 50%) and "underconfident" (accuracy > 75% & confidence < 40%)
* Implementation:

  * Create `generateRecommendations(quizId)` that composes prompts + includes aggregated stats, then calls LLM to turn numbers into readable suggestions.
  * Keep recommended actions as structured JSON and human-readable text.

---

## Student personalized insights

* After several attempts, compute per-student trends:

  * Rolling average score
  * Confidence drift over time
  * Topics to review
* Provide `GET /api/v1/students/:studentId/insights` that returns both charts and AI-generated study plan (3-5 bullets)
* Optionally email or notify student with action items.

---

## Safety & accuracy (critical)

* Always present AI outputs as *suggestions* — teacher must review before applying.
* Use deterministic prompts, few-shot examples, and scoring heuristics to reduce hallucination.
* Cache AI outputs and show provenance (source text or slide numbers used).

---

## Frontend flows

* `AIUpload` component: file drag-drop + progress
* `AIDrafts` list: preview generated questions and quick-edit (same `QuestionEditor`)
* `TeacherRecommendations` page: show LLM produced suggestions, allow teacher to accept or refine
* `StudentInsights` page: charts + AI paragraph

---

# Cross-cutting concerns (applies to all phases)

## Logging & monitoring

* Server logs (winston) + error tracking (Sentry)
* Track metrics: quiz creation rate, attempt rate, average time per attempt

## Accessibility

* Keyboard accessible question navigation
* Screen-reader friendly labels
* High-contrast available

## Internationalization

* Plan for text keys (i18n) if needed later

## Versioning

* Version API (`/api/v1/...`)
* Migrations for schema changes (use `migrate-mongo` or similar)


---

# Milestones & checklist style (developer sprint checklist)

## Phase 1 sprints

1. Repo + boilerplate + Docker + env
2. Auth (JWT) + user model + role middleware
3. Quiz model & CRUD API + basic teacher UI (list/create/edit)
4. Student join flow (code/pin & link) + info capture
5. Attempt start/save/submit endpoints + frontend attempt flow (question-by-question)
6. Scoring util & integrate grading on submit
7. Results display: student + teacher
8. Tests: scoring unit tests, basic endpoint tests
9. Deploy basic stack (staging) + docs

## Phase 2 sprints

1. Add event logging hooks in attempt flow
2. Back-end endpoints to receive events and record in attempt docs
3. Implement penalties in grading util
4. Build teacher analytics endpoints using aggregation pipelines
5. Frontend analytics dashboards (charts + suspicious list)
6. E2E tests for focus detection event capture & penalty
7. Real-time monitor (optional websockets)

## Phase 3 sprints

1. Integrate file upload + parsing
2. Implement aiService wrapper + safe prompt templates
3. Q-generation pipeline + staging DB + teacher review UI
4. Recommendation generator endpoints + teacher UI
5. Student insights UI
6. Safety checks, caching, and review workflow
7. Load & rate-limit LLM calls, cost monitoring
8. Final tests + documentation

---

# Helpful implementation notes & tips

* Use **pre-signed S3** for uploads if files may be large.
* Keep `correctAnswer` server-only encryption until teacher reveals results.
* For LaTeX: use KaTeX to render; for writing allow `$...$` and `$$...$$`.
* For question reordering in `QuizForm`, use a drag-drop library (e.g., `react-beautiful-dnd`).
* For charts use `recharts` or `chart.js` via lightweight wrapper. Fetch aggregated data precomputed on backend.
* Keep LLM prompts small by sending only the extracted, relevant text chunk and a few-shot example.
* Make scoring config per-quiz so different teachers can choose penalty/scale.

---


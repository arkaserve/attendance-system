# Attendance Tracker

A full-stack attendance management system for tracking student attendance across lectures. Built for a final-year project.

## Features

- Manage students (name, email, class, roll number) with search and class filters
- Schedule lectures (subject, date, time, topic) with filters by date / subject / date range
- Mark attendance per lecture with Present / Absent / Late status per student (bulk upsert)
- Dashboard with today's stats and low-attendance warnings (< 75%)
- Reports page with per-student attendance percentages and progress bars
- SQLite storage with cascading deletes and unique (lecture, student) constraints

## Tech Stack

- **Backend:** Node.js (ESM), Express, `node:sqlite` (built-in SQLite, no native deps)
- **Frontend:** React 18 + Vite, React Router v6
- **Database:** SQLite (auto-created and seeded on first run)

## Project Structure

```
AttendanceSystem/
├── backend/
│   ├── database.js          # DB init + schema + seed
│   ├── server.js            # Express app, /api/stats, 404 + error handlers
│   ├── package.json
│   └── routes/
│       ├── students.js
│       ├── lectures.js
│       └── attendance.js
├── frontend/
│   ├── vite.config.js       # proxies /api -> localhost:5000
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── components/      # Navbar, Toast, StudentForm, LectureForm
│       └── pages/           # Dashboard, Students, Lectures, MarkAttendance, Reports
└── README.md
```

## Run Steps

1. Backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
   The server runs on `http://localhost:5000`. The SQLite database file (`attendance.db`) is created and seeded automatically on first start.

2. Frontend (in a second terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173`.

3. Production build:
   ```bash
   cd frontend
   npm run build
   ```

## API Table

| Method | Endpoint                     | Description                                              |
| ------ | ---------------------------- | -------------------------------------------------------- |
| GET    | /api/students                | List students; `?search=&class=` filters                 |
| POST   | /api/students                | Create student                                           |
| PUT    | /api/students/:id            | Update student                                           |
| DELETE | /api/students/:id            | Delete student (cascades attendance)                     |
| GET    | /api/lectures                | List lectures with present/absent/late counts; `?date=&subject=&from=&to=` |
| POST   | /api/lectures                | Create lecture                                           |
| PUT    | /api/lectures/:id            | Update lecture                                           |
| DELETE | /api/lectures/:id            | Delete lecture (cascades attendance)                     |
| GET    | /api/lectures/:id/attendance | Roster of all students with saved status (default present) |
| POST   | /api/lectures/:id/attendance | Bulk upsert `{rows:[{student_id,status}]}`               |
| PATCH  | /api/attendance/:id          | Update a single attendance record's status               |
| GET    | /api/stats                   | Totals, today's stats, low-attendance list, per-student percentages |

## Deployment (Netlify + Render)

This app is a two-part system, so it ships as **static UI on Netlify + persistent API/DB on Render**:

```
Browser ──/── Netlify (frontend/dist) ──/api/*──▶ Render (backend + attendance.db)
```

Backend config + generated files:

- `netlify.toml` — build `frontend/`, publish `frontend/dist`, SPA fallback, `/api/*` proxy.
- `render.yaml` — backend Web Service with a **1 GB persistent disk** mounted at `/data`
  (`DB_PATH=/data/attendance.db`) so attendance survives restarts.
- `Dockerfile` + `.dockerignore` — containerized backend (node:24, file-backed SQLite).

### Backend → Render (persistent, keeps data)

1. Push this repo to GitHub.
2. **Render Dashboard → New → Web Service → connect the repo** (it auto-detects `render.yaml`).
3. Confirm a disk is attached (`/data`, 1 GB) and the Start Command is `node server.js`.
4. Note the service URL, e.g. `https://attendance-backend.onrender.com`.

> SQLite stays on the Render disk, so student/lecture/attendance rows persist across deploys.

### Frontend → Netlify (static build)

Option A — drag & drop:

```bash
cd frontend
npm install
npm run build
```

Then upload the generated `frontend/dist/` to Netlify manually.

Option B — CLI:

```bash
npm i -g netlify-cli
netlify login
netlify deploy --dir frontend\dist --prod
```

Option C — Git integration: import the repo in Netlify, set Build = `cd frontend && npm install && npm run build`,
Publish = `frontend/dist`. The `netlify.toml` already encodes both.

### Point the UI at the live API

After deploying the backend, open `netlify.toml` and replace the placeholder:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://attendance-backend.onrender.com/api/:splat"   # ← your real Render URL
  status = 200
  force = true
```

Then redeploy (`netlify deploy --prod` or push to the branch).

> Dev tip: locally the Vite proxy already maps `/api` → `http://localhost:5000`, so the same
> frontend code works in `npm run dev` and in production — no code changes needed.

### Optional self-host backend (Docker)

```bash
docker build -t attendance-backend .
docker run -p 5000:5000 -v attendance-data:/data attendance-backend
```

## Data Model

- **students** — id, name, email (unique), class, roll_number
- **lectures** — id, subject, date, start_time, end_time, topic
- **attendance** — id, lecture_id (FK), student_id (FK), status ('present'|'absent'|'late'), marked_at, unique (lecture_id, student_id)
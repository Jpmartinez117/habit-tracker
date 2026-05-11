# uGoal — Habit Tracker

A full-stack habit tracking web app. Users register, log in, create daily
habits, log daily completions and an optional mood (1–5), and view monthly
heatmap and metric breakdowns of their progress.

- **Frontend:** React 19 + TypeScript + Vite + Bootstrap 5
- **Backend:** FastAPI + SQLAlchemy + Pydantic v2
- **Database:** MySQL
- **Auth:** JWT bearer tokens (HS256)

## Setup

Prerequisites: Python 3, Node.js + npm, and a running MySQL server.

### 1. Configure the backend environment

Create `backend/.env`:

```
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/habit_tracker
```

### 2. Create the database

```
mysql -u root -p < init_db.sql
```

**Note — `mysql` must be on your PATH.** On Windows, the MySQL CLI is
typically installed at `C:\Program Files\MySQL\MySQL Server 8.0\bin\` but is
not added to `PATH` by default. If `mysql` isn't recognized, either:

- run it with the full path:
  `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < init_db.sql`, or
- add that folder to your system `PATH` and restart your terminal.

**Note — shell syntax.** The `<` redirection works in `cmd.exe` and
`bash`/`zsh`. In **PowerShell**, use `Get-Content init_db.sql | mysql -u root -p`
instead, or open `mysql -u root -p` interactively and run `source init_db.sql;`.

### 3. Create the tables

```
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python create_tables.py
cd ..
```

### 4. Populate demo data

```
python seed_data.py
```

This creates a demo user, four habits, two weeks of habit logs, and ten mood
logs so every page has visible content on first login.

**Demo credentials:** `demo@ugoal.app` / `demo1234`

### 5. Run the backend

```
cd backend
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000` — interactive docs at `/docs`.

### 6. Run the frontend

```
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Project Layout

```
habit-tracker/
├── init_db.sql            # Creates the MySQL database
├── seed_data.py           # Populates the database with demo data
├── backend/
│   ├── create_tables.py   # Creates tables from SQLAlchemy models
│   └── app/
│       ├── core/          # database, security (JWT + password hash), dependencies
│       ├── models/        # SQLAlchemy ORM models
│       ├── schemas/       # Pydantic request/response schemas
│       ├── routes/        # FastAPI routers
│       ├── services/      # Business logic
│       └── main.py        # App entry point + CORS
├── frontend/
│   └── src/
│       ├── pages/         # Landing, Login, Register, Dashboard, Manage, Logging, Data
│       ├── components/    # Heatmap grid, metrics panel, habit rows
│       ├── services/      # API clients (fetch wrappers)
│       └── types/         # Shared TypeScript types
└── docs/database/
    └── habit_tracker_schema.mwb   # MySQL Workbench EER diagram
```

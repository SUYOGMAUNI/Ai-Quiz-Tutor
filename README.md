# 🎓 AI Quiz Tutor

An AI-powered fullstack web app that generates quizzes from uploaded PDFs using Groq LLaMA 3.1. Upload any document, get smart MCQ questions, track your scores, and improve on your weak areas.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [AI Prompt Design](#ai-prompt-design)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Feature Roadmap](#feature-roadmap)

---

## Overview

### What it does

1. User registers and logs in
2. Uploads a PDF (textbook, notes, article)
3. Backend parses and chunks the PDF into pieces
4. Each chunk is sent to Groq's LLaMA 3.1 8B with a structured prompt
5. LLM returns MCQ questions in JSON format
6. User takes the quiz — timer, options, instant explanation after each answer
7. Scores are saved per user per PDF
8. System tracks accuracy per difficulty (Easy / Medium / Hard)

### Why this stack

| Decision | Reason |
|----------|--------|
| Groq + LLaMA 3.1 | Ultra-fast inference (~500 tok/s), free tier available |
| FastAPI | Async, auto-docs at `/docs`, fast development |
| PostgreSQL | Relational data fits perfectly (users → pdfs → questions → attempts) |
| React + Vite | Fast UI development, instant HMR |
| JWT Auth | Stateless, works well with REST APIs |
| PyMuPDF | Best Python library for PDF text extraction, handles complex layouts |

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │  REST   │                  │  SQL    │                 │
│  React Frontend │ ──────► │  FastAPI Backend │ ──────► │   PostgreSQL    │
│  (Vercel)       │ ◄────── │  (Render)        │         │   (Supabase)    │
│                 │  JSON   │                  │         │                 │
└─────────────────┘         └────────┬─────────┘         └─────────────────┘
                                     │
                                     │ Groq API
                                     ▼
                            ┌──────────────────┐
                            │  LLaMA 3.1 8B    │
                            │  (via Groq)      │
                            └──────────────────┘
```

### Request Flow — Quiz Generation

```
User uploads PDF
     │
     ▼
FastAPI receives file
     │
     ▼
PyMuPDF extracts text
     │
     ▼
Text split into chunks
     │
     ▼
Each chunk → Groq API (batched async, 2 at a time)
     │
     ▼
LLM returns JSON questions
     │
     ▼
Questions saved to PostgreSQL
     │
     ▼
Quiz served to frontend
```

---

## Tech Stack

### Backend
- **Python 3.11**
- **FastAPI** — API framework
- **SQLAlchemy 2.0** — ORM
- **Alembic** — DB migrations
- **PyMuPDF (fitz)** — PDF parsing
- **groq** — Groq Python SDK
- **json-repair** — Robust LLM JSON parsing
- **python-jose** — JWT tokens
- **passlib[bcrypt]** — password hashing
- **psycopg2-binary** — PostgreSQL driver

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router v6**
- **Zustand** — auth state management
- **Axios** — HTTP client

### Infrastructure
- **Docker + Docker Compose** — local dev
- **PostgreSQL 15**
- **Supabase** — hosted DB (free 500MB)
- **Render** — backend hosting
- **Vercel** — frontend hosting

---

## Project Structure

```
ai-quiz-tutor/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry, CORS, router registration
│   │   ├── config.py            # Settings loaded from .env
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── pdf.py
│   │   │   ├── question.py
│   │   │   └── attempt.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── pdf.py
│   │   │   ├── quiz.py
│   │   │   └── stats.py
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/register, POST /auth/login
│   │   │   ├── pdfs.py          # POST /pdfs/upload, GET /pdfs/, DELETE /pdfs/{id}
│   │   │   ├── quiz.py          # GET /quiz/{pdf_id}, POST /quiz/submit
│   │   │   └── stats.py         # GET /stats/{pdf_id}
│   │   └── services/
│   │       ├── auth.py          # Password hashing, token creation
│   │       ├── pdf_parser.py    # PyMuPDF extraction + chunking
│   │       └── quiz.py          # Question retrieval logic
│   ├── groq_client.py           # Groq API calls + JSON repair + batching
│   ├── alembic/
│   ├── uploads/                 # Local PDF storage (dev only)
│   ├── .env
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PDFUpload.jsx
│   │   │   ├── QuizCard.jsx
│   │   │   ├── ScoreBoard.jsx
│   │   │   └── Timer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Quiz.jsx
│   │   │   └── Stats.jsx
│   │   ├── store/
│   │   │   └── authStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Database Schema

```sql
users
├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
├── email             VARCHAR UNIQUE NOT NULL
├── hashed_password   VARCHAR NOT NULL
└── created_at        TIMESTAMP DEFAULT now()

pdfs
├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
├── filename          VARCHAR NOT NULL
├── chunk_count       INTEGER NOT NULL
└── uploaded_at       TIMESTAMP DEFAULT now()

questions
├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
├── pdf_id            UUID REFERENCES pdfs(id) ON DELETE CASCADE
├── question          TEXT NOT NULL
├── options           JSONB NOT NULL        -- {"A": "...", "B": "...", "C": "...", "D": "..."}
├── answer            VARCHAR(1) NOT NULL   -- "A" | "B" | "C" | "D"
├── explanation       TEXT NOT NULL
└── difficulty        VARCHAR NOT NULL      -- "easy" | "medium" | "hard"

attempts
├── id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
├── user_id           UUID REFERENCES users(id) ON DELETE CASCADE
├── question_id       UUID REFERENCES questions(id) ON DELETE CASCADE
├── selected          VARCHAR(1) NOT NULL
├── is_correct        BOOLEAN NOT NULL
└── attempted_at      TIMESTAMP DEFAULT now()
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{email, password}` | `{access_token}` |
| POST | `/auth/login` | `{email, password}` | `{access_token}` |

### PDFs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/pdfs/upload` | ✅ | Upload PDF file (multipart/form-data) |
| GET | `/pdfs/` | ✅ | List all PDFs for current user |
| DELETE | `/pdfs/{pdf_id}` | ✅ | Delete PDF and all its questions/attempts |

### Quiz

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/quiz/{pdf_id}` | ✅ | Get questions for a PDF (`?limit=10`) |
| POST | `/quiz/submit` | ✅ | Submit answer `{question_id, selected}` |

### Stats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats/{pdf_id}` | ✅ | Score breakdown + accuracy per difficulty |

All protected routes require: `Authorization: Bearer <token>`

---

## AI Prompt Design

### System Prompt

```
You are an expert tutor and quiz generator. Given content extracted from a PDF, generate high-quality quiz questions.

Rules:
- Only generate questions from the provided content. Never use outside knowledge.
- Each question must have exactly 4 options (A, B, C, D).
- Only one correct answer per question.
- Vary difficulty: 40% easy, 40% medium, 20% hard.
- Never repeat questions.
- If content is insufficient, generate fewer questions rather than hallucinating.

Respond ONLY in this JSON format, no extra text:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "answer": "A",
      "explanation": "...",
      "difficulty": "easy|medium|hard"
    }
  ]
}
```

### Chunking & Batching Strategy

- PDF text extracted with PyMuPDF, split into chunks
- Each chunk generates **4 questions**
- Processed in **batches of 2 chunks** with a **15s delay** between batches to respect Groq's TPM limit (6000 tokens/min)
- LLM responses parsed with `json-repair` to handle malformed JSON (doubled quotes, unquoted values, comma-containing option strings)

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql://quizuser:quizpass@db:5432/quiztutor
SECRET_KEY=your-strong-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your-groq-api-key-here
UPLOAD_DIR=uploads
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

---

## Local Development

### With Docker (recommended)

**Prerequisites:** Docker + Docker Compose

```bash
git clone https://github.com/SUYOGMAUNI/Ai-Quiz-Tutor.git
cd Ai-Quiz-Tutor

cp backend/.env.example backend/.env
# Fill in GROQ_API_KEY and SECRET_KEY

docker-compose up --build

# First time only — run migrations
docker-compose exec backend alembic upgrade head
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

### Without Docker

**Prerequisites:** Python 3.10+, Node.js 18+, PostgreSQL running locally

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure .env then run migrations
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```


---

## Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in and click **Create API Key**
3. Paste into `backend/.env` as `GROQ_API_KEY`

Free tier: **6,000 tokens/min**, **30 requests/min** on LLaMA 3.1 8B Instant

---

## Feature Roadmap

### v1 (MVP) ✅
- [x] JWT Auth (register / login)
- [x] PDF upload + parsing
- [x] Groq LLaMA quiz generation
- [x] MCQ quiz UI with countdown timer
- [x] Score tracking per user per PDF
- [x] Accuracy breakdown by difficulty
- [x] Delete PDF + cascade cleanup

### v2
- [ ] Highlight which PDF section each question came from
- [ ] Study mode — flashcards before quiz
- [ ] Export quiz as PDF
- [ ] Share quiz via link (no login required)

### v3
- [ ] Leaderboard across users on the same PDF
- [ ] Multi-language support (Nepali + English)
- [ ] Mobile app (React Native)
- [ ] LLM-powered chat: "Explain this topic from the PDF"

---

Built by [Suyog Mauni](https://suyogmauni.com.np) · 2025

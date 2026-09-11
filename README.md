# Kinetix

Kinetix is a multi-role fitness platform prototype being evolved into a production-capable MVP for fitness tracking, verified trainer discovery, trainer-client coaching, gym participation and fitness communities.

The current repository contains the original vanilla HTML/CSS/JavaScript prototype at the repository root and a new FastAPI/PostgreSQL backend under [`backend/`](backend/README.md).

## Current repository layout

```text
.
├── index.html           # Existing interactive frontend prototype
├── app.js               # Existing browser-side prototype state and behavior
├── style.css            # Existing frontend styling
└── backend/             # FastAPI modular-monolith backend
```

## Backend quick start

```bash
cd backend
cp .env.example .env
docker compose up -d db
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

Open Swagger at `http://localhost:8000/docs`.

See [`backend/README.md`](backend/README.md) for the implemented domains, architecture, migration commands and intentional MVP boundaries.

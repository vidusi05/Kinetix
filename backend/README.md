# Kinetix Backend

This directory is the first production-oriented backend slice for the existing Kinetix frontend prototype.
It is intentionally a **modular monolith** using FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic and Pydantic.

## What is implemented in this foundation

- Async PostgreSQL session management.
- Alembic migration infrastructure and an initial relational schema.
- Central `users` plus database-driven roles instead of separate login silos.
- Global trainer verification separated from gym-trainer affiliation state.
- Gyms separated from physical branches.
- Relational workout programs, sessions, exercises and individual sets so analytics can be computed later.
- Explicit trainer-client coaching relationships with conservative data-access flags.
- Public discovery APIs for approved trainers and gyms.
- Public exercise-catalog API.
- Liveness/readiness endpoints, centralized application errors, CORS and structured logging configuration.
- Docker development setup and idempotent development seed data.

The backend does **not** yet hard-code auth, payments, package rules, refunds, trainer payouts, private document storage, messaging permissions, or booking state transitions. Those were deliberately left out because the supplied product brief marks them as business decisions rather than facts.

## Structure

```text
backend/
  app/
    api/
    common/
    core/
    health/
    users/
    trainers/
    gyms/
    coaching/
    workouts/
    main.py
  alembic/
  tests/
```

Domain modules follow the intended `router -> service -> repository -> SQLAlchemy -> PostgreSQL` direction for API-backed features.

## Local setup

```bash
cd backend
cp .env.example .env
docker compose up -d db
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -e ".[dev]"
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

Swagger is available at `http://localhost:8000/docs`.

## Current API

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /api/v1/trainers`
- `GET /api/v1/trainers/{trainer_id}`
- `GET /api/v1/gyms`
- `GET /api/v1/gyms/{gym_id}`
- `GET /api/v1/exercises`

## Migrations

```bash
alembic upgrade head
alembic downgrade -1
alembic revision --autogenerate -m "describe change"
```

## Tests

```bash
pytest
ruff check .
```

## Important implementation boundaries

The current vanilla-JS prototype stores trainer rosters, packages, workout routines, forum threads and chats in browser memory. The pitch deck prioritizes the workout logger and trainer booking for the MVP, while also describing verified matching, gym communities and commission revenue. This foundation makes the shared entities durable without treating prototype prices, USD currency, simulated auto-approval, or mock trainer status changes as production business rules.

The next backend slices should be implemented after confirming the unresolved rules for authentication, booking/availability, packages/payments, messaging access, community moderation and object storage.

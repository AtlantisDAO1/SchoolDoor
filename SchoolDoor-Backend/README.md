# SchoolDoor Backend

FastAPI service powering SchoolDoor's school ratings and reviews. Includes SQLAlchemy models, Alembic migrations, and Docker/Makefile workflows for local dev and prod deploys.

## Getting Started

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp env.example .env
make dev
```

## Configuration
 
The application requires the following environment variables (set in `.env`):
 
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT Signing Key | `change-this-in-prod` |
| `ADMIN_EMAIL` | Default Admin Email | `admin@example.com` |
| `ADMIN_PASSWORD` | Default Admin Password | `secure-password` |
| `PERPLEXITY_API_KEY` | AI Service Key | `pplx-...` |
 
## Docker


```bash
make dev   # docker-compose.dev.yml
make prod  # docker-compose.prod.yml
```

## Database
 
The backend defaults to using **Supabase (PostgreSQL)**. 
 
1.  Ensure your `.env` contains the valid `DATABASE_URL` for your Supabase instance.
2.  Run migrations: `alembic upgrade head`.


## Tests

Add tests under `app/tests` (create if missing) and run `pytest`.

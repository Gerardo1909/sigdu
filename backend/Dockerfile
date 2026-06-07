FROM python:3.12-slim

WORKDIR /code

COPY pyproject.toml .

RUN pip install uv && uv pip install --system \
    "fastapi>=0.111" \
    "uvicorn[standard]>=0.30" \
    "sqlalchemy[asyncio]>=2.0" \
    "asyncpg>=0.29" \
    "alembic>=1.13" \
    "pydantic>=2.7" \
    "pydantic-settings>=2.3" \
    "python-jose[cryptography]>=3.3" \
    "passlib[bcrypt]>=1.7" \
    "bcrypt<4.0.0" \
    "python-multipart>=0.0.9" \
    "openpyxl>=3.1" \
    "email-validator>=2.1"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

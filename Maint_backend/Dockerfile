FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (Prisma client might need openSSL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker build cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application source code
COPY . .

# Expose core API port
EXPOSE 8000

# Automated database schema migration and startup
CMD ["sh", "-c", "prisma generate --schema app/prisma_schema.prisma && prisma db push --schema app/prisma_schema.prisma && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies required for compiling native modules (like hnswlib for ChromaDB)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker build cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application source code
COPY . .

# Expose RAG API port
EXPOSE 8001

# Launch the RAG service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

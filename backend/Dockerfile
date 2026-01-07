# Use official Python image (safe, correct version)
FROM python:3.12-slim

# Install system dependencies needed by psycopg2 and Django
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy requirements file first (to cache installs)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Default command: run Django server
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media /app/logs

# Copy project files
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=politico.settings.production

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "politico.wsgi:application"] 
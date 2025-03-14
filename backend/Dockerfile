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

# Install additional packages required by the application
RUN pip install django-filter pandas openpyxl Pillow requests beautifulsoup4

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media /app/logs

# Copy project files
COPY . .

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
echo "Waiting for postgres..."\n\
sleep 5\n\
\n\
echo "Running migrations..."\n\
python manage.py migrate\n\
\n\
echo "Starting application..."\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=politico.settings.production
ENV DJANGO_ENV=production
ENV PYTHONUNBUFFERED=1

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "politico.wsgi:application"] 
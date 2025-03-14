#!/bin/sh
set -e

echo "Waiting for postgres..."
sleep 5

echo "Running migrations..."
python manage.py migrate

echo "Fetching initial Althingi data..."
python -c "from parliament.tasks import fetch_althingi_data; fetch_althingi_data.delay()"

echo "Fetching initial voting records..."
python -c "from parliament.tasks import fetch_voting_records; fetch_voting_records.delay()"

echo "Starting application..."
exec "$@" 
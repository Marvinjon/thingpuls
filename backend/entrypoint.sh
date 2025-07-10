#!/bin/sh
set -e

echo "Waiting for postgres..."
sleep 5

echo "Running migrations..."
python manage.py migrate

echo "Starting application..."
exec "$@" 
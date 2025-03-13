#!/bin/bash
# Setup script for local development environment

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    echo "Activating virtual environment..."
    source ../venv/bin/activate
fi

# Install debug toolbar for local development
echo "Installing django-debug-toolbar..."
pip install django-debug-toolbar

# Make sure all requirements are installed
echo "Installing requirements..."
pip install -r ../requirements.txt

# Run migrations
echo "Running migrations..."
cd ..
python manage.py migrate

echo "Setup complete! You can now run the development server with:"
echo "python manage.py runserver" 
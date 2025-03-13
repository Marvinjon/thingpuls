#!/bin/bash

# Navigate to the backend directory
cd backend

# Run migrations
python manage.py migrate

# Fetch initial data
echo "Fetching Althingi data (parties, MPs)..."
python manage.py fetch_althingi_data

# Check if we want to process a specific bill only
if [ "$1" == "--bill" ] && [ -n "$2" ]; then
    echo "Fetching voting records for bill $2 only..."
    python manage.py fetch_voting_records --bill "$2" --force
elif [ "$1" == "--help" ]; then
    echo "Usage:"
    echo "  ./run_local.sh                    # Run normally, fetch all data"
    echo "  ./run_local.sh --bill NUMBER      # Only fetch a specific bill"
    echo "  ./run_local.sh --skip-fetch       # Skip data fetching, just run the server"
    echo "  ./run_local.sh --help             # Show this help message"
    exit 0
elif [ "$1" == "--skip-fetch" ]; then
    echo "Skipping data fetch as requested..."
else
    # Default: fetch all voting records
    echo "Fetching all voting records (this may take a while)..."
    echo "If this hangs, try running with a specific bill: ./run_local.sh --bill NUMBER"
    python manage.py fetch_voting_records --force
fi

# Start the development server
echo "Starting development server..."
python manage.py runserver 
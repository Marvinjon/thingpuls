#!/bin/bash

# Script to fetch voting records from the Althingi website

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Default values
SESSION=156
BILL=""
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --session)
        SESSION="$2"
        shift
        shift
        ;;
        --bill)
        BILL="$2"
        shift
        shift
        ;;
        --force)
        FORCE=true
        shift
        ;;
        *)
        echo "Unknown option: $1"
        exit 1
        ;;
    esac
done

# Build command
CMD="python manage.py fetch_voting_records --session $SESSION"

if [ ! -z "$BILL" ]; then
    CMD="$CMD --bill $BILL"
fi

if [ "$FORCE" = true ]; then
    CMD="$CMD --force"
fi

# Run the command
echo "Running: $CMD"
cd backend
$CMD

echo "Done!" 
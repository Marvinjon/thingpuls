#!/bin/bash
# Run all data scrapers in the correct order

# Default session number
SESSION=${1:-157}

echo "========================================="
echo "Data Collection for Session $SESSION"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run a script and check result
run_script() {
    local script=$1
    local description=$2
    
    echo -e "${BLUE}>>> $description${NC}"
    python "$script" "$SESSION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $description completed successfully${NC}"
        echo ""
    else
        echo -e "${RED}✗ $description failed${NC}"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Exiting..."
            exit 1
        fi
    fi
}

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.." || exit 1

echo "Working directory: $(pwd)"
echo ""

# Check if virtual environment is activated (skip in Docker)
if [[ "$VIRTUAL_ENV" == "" ]] && [[ ! -f "/.dockerenv" ]]; then
    echo -e "${RED}Warning: Virtual environment not activated!${NC}"
    echo "Please activate your virtual environment first:"
    echo "  source ../venv/bin/activate"
    echo ""
    exit 1
fi

echo "Starting data collection..."
echo ""

# 1. Fetch parties (required for MPs)
run_script "scrapers/fetch_parties.py" "1. Fetching Political Parties"

# 2. Fetch MPs (required for bills, speeches, votes, interests)
run_script "scrapers/fetch_mps.py" "2. Fetching MPs (Members of Parliament)"

# 3. Fetch bills (required for votes and speeches)
run_script "scrapers/fetch_bills.py" "3. Fetching Bills/Legislation"

# 4. Assign topics to bills
echo -e "${BLUE}>>> 4. Assigning Topics to Bills${NC}"
python scrapers/assign_topics.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Topic assignment completed successfully${NC}"
    echo ""
else
    echo -e "${RED}✗ Topic assignment failed${NC}"
    echo ""
fi

# 5. Fetch voting records
run_script "scrapers/fetch_voting_records.py" "5. Fetching Voting Records"

# 6. Fetch speeches
run_script "scrapers/fetch_speeches.py" "6. Fetching MP Speeches"

# 7. Fetch MP interests
echo -e "${BLUE}>>> 7. Fetching MP Financial Interests${NC}"
python scrapers/fetch_interests.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MP interests fetching completed successfully${NC}"
    echo ""
else
    echo -e "${RED}✗ MP interests fetching failed${NC}"
    echo ""
fi

echo "========================================="
echo -e "${GREEN}✓ All Data Collection Complete!${NC}"
echo "========================================="


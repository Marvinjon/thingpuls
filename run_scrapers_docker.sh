#!/bin/bash
# Run all scrapers inside Docker container

SESSION=${1:-156}

echo "Running scrapers inside Docker container for session $SESSION..."
echo ""

docker compose exec backend bash -c "
echo '1. Fetching Political Parties...'
python scrapers/fetch_parties.py $SESSION
echo ''

echo '2. Fetching MPs...'
python scrapers/fetch_mps.py $SESSION
echo ''

echo '3. Fetching Bills...'
python scrapers/fetch_bills.py $SESSION
echo ''

echo '4. Assigning Topics...'
python scrapers/assign_topics.py
echo ''

echo '5. Fetching Voting Records...'
python scrapers/fetch_voting_records.py $SESSION
echo ''

echo '6. Fetching Speeches...'
python scrapers/fetch_speeches.py $SESSION
echo ''

echo '7. Fetching MP Interests...'
python scrapers/fetch_interests.py
echo ''

echo 'All done!'
"


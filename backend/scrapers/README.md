# Data Scrapers for Politico Web

All data scraping scripts are in this **one folder** - `backend/scrapers/`. Simple and organized!

## Requirements

- Python 3.x with virtual environment activated
- Django project properly configured
- Required packages: `requests`, `django`

## ⚠️ Important: Activate Virtual Environment First!

**Before running any scripts, activate your virtual environment:**

```bash
# From the project root
cd politico_web
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate  # On Windows
```

## Quick Start

```bash
# Make sure venv is activated, then:
cd backend
./scrapers/run_all.sh 156
```

This runs all scrapers in the correct order for session 156.

## Available Scripts

All in `backend/scrapers/`:

- **`fetch_parties.py`** - Fetch political parties
- **`fetch_mps.py`** - Fetch MPs (Members of Parliament)  
- **`fetch_bills.py`** - Fetch bills/legislation
- **`fetch_voting_records.py`** - Fetch voting records
- **`fetch_speeches.py`** - Fetch MP speeches
- **`fetch_interests.py`** - Fetch MP financial interests
- **`assign_topics.py`** - Assign topics to bills based on keywords

## Usage

### Basic Usage

```bash
# From the backend directory (with venv activated)
cd backend

# Fetch parties for session 156 (default)
python scrapers/fetch_parties.py 156

# Fetch parties for a specific session
python scrapers/fetch_parties.py 155
```

### 1. Fetch Political Parties

```bash
python scrapers/fetch_parties.py [session_number]
```

**Default session:** 156

### 2. Fetch MPs (Members of Parliament)

```bash
python scrapers/fetch_mps.py [session_number]
```

**Note:** Run `fetch_parties.py` first, as MPs are linked to parties.

### 3. Fetch Bills

```bash
python scrapers/fetch_bills.py [session_number]
```

**Note:** This fetches all bills for the session. May take several minutes.

### 4. Fetch Voting Records

```bash
# Fetch voting records for all bills
python scrapers/fetch_voting_records.py [session_number]

# Fetch for a specific bill
python scrapers/fetch_voting_records.py [session_number] [bill_number]
```

**Note:** Run `fetch_bills.py` and `fetch_mps.py` first.

### 5. Fetch Speeches

```bash
# Fetch speeches for all active MPs
python scrapers/fetch_speeches.py [session_number]

# Fetch for a specific MP
python scrapers/fetch_speeches.py [session_number] [mp_id]
```

**Note:** Run `fetch_mps.py` first.

### 6. Fetch MP Financial Interests

```bash
# Fetch interests for all active MPs
python scrapers/fetch_interests.py

# Fetch for a specific MP
python scrapers/fetch_interests.py [mp_id]
```

**Note:** Run `fetch_mps.py` first.

### 7. Assign Topics to Bills

```bash
# Assign topics
python scrapers/assign_topics.py

# Clear existing and reassign
python scrapers/assign_topics.py --clear
```

**Note:** Run `fetch_bills.py` first.

## Recommended Order

For a fresh database, run in this order:

```bash
# Make sure venv is activated and you're in backend directory
cd backend

# 1. Fetch parties (required for MPs)
python scrapers/fetch_parties.py 156

# 2. Fetch MPs (required for bills, speeches, votes, interests)
python scrapers/fetch_mps.py 156

# 3. Fetch bills (required for votes and speeches)
python scrapers/fetch_bills.py 156

# 4. Assign topics to bills
python scrapers/assign_topics.py

# 5. Fetch voting records
python scrapers/fetch_voting_records.py 156

# 6. Fetch speeches
python scrapers/fetch_speeches.py 156

# 7. Fetch MP interests
python scrapers/fetch_interests.py
```

**Or use the automated script:**

```bash
cd backend
./scrapers/run_all.sh 156
```

## Data Source

All data is fetched from the official Alþingi XML API:
- Base URL: `https://www.althingi.is/altext/xml/`
- Documentation: [Alþingi API Documentation](https://www.althingi.is/altext/)

## Output

Each script provides:
- ✓ Success messages for created/updated records
- ✗ Error messages for failed operations
- Summary statistics at the end

## Troubleshooting

### Common Issues

1. **"Session does not exist"**
   - The script will automatically create the session if it doesn't exist

2. **"MP/Party not found"**
   - Make sure you run `fetch_parties.py` before `fetch_mps.py`
   - Make sure you run `fetch_mps.py` before other scripts that depend on MPs

3. **HTTP timeout errors**
   - The scripts have built-in retry logic
   - If the Alþingi API is slow, the script will wait and retry

4. **"No module named 'parliament'"**
   - Make sure you're running from the backend directory
   - Make sure Django is properly configured

### Logging

All errors are printed to stdout. You can redirect to a file:

```bash
python scrapers/fetch_bills.py 156 > fetch_bills.log 2>&1
```

## Notes

- All scripts are idempotent - you can run them multiple times safely
- Existing records will be updated, not duplicated
- Scripts use transactions to ensure data consistency
- Built-in delays prevent overwhelming the Alþingi API
- Default session is 156 (current session as of 2024)

## Development

These scripts are designed to be:
- **Simple**: One file per data type
- **Standalone**: Each can run independently
- **Clear**: Easy to understand and modify
- **Robust**: Error handling and retries built-in

To modify a scraper, simply edit the corresponding Python file.

## Support

For issues or questions:
1. Check the script output for error messages
2. Verify you're running scripts in the correct order
3. Check the Alþingi API is accessible: https://www.althingi.is/altext/xml/

# Data Scrapers for Politico Web

All data scraping scripts are in this **one folder** - `backend/scrapers/`. Simple and organized!

## Requirements

- Docker and Docker Compose installed
- Backend service running in Docker
- All dependencies are automatically installed in the Docker container

## ⚠️ Important: Use Docker!

**This project uses Docker for all operations. Make sure your Docker services are running:**

```bash
# From the project root
./start.sh dev -d  # Start development environment in detached mode
# or
docker compose up -d  # Start all services
```

## Quick Start

**Recommended: Use the main startup script:**

```bash
# From the project root
./start.sh scrapers 157
```

**Or run directly in Docker:**

```bash
# From the project root
docker compose exec backend bash -c "cd /app && ./scrapers/run_all.sh 157"
```

This runs all scrapers in the correct order for session 157 (2025-2026).

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

**Run scrapers inside Docker container:**

```bash
# From the project root
docker compose exec backend python scrapers/fetch_parties.py 157

# Or for a different session
docker compose exec backend python scrapers/fetch_parties.py 156
```

**Or use the startup script:**

```bash
./start.sh django shell
# Then inside the shell:
python scrapers/fetch_parties.py 157
```

### 1. Fetch Political Parties

```bash
docker compose exec backend python scrapers/fetch_parties.py [session_number]
```

**Default session:** 156

### 2. Fetch MPs (Members of Parliament)

```bash
docker compose exec backend python scrapers/fetch_mps.py [session_number]
```

**Note:** Run `fetch_parties.py` first, as MPs are linked to parties.

### 3. Fetch Bills

```bash
docker compose exec backend python scrapers/fetch_bills.py [session_number]
```

**Note:** This fetches all bills for the session. May take several minutes.

### 4. Fetch Voting Records

```bash
# Fetch voting records for all bills
docker compose exec backend python scrapers/fetch_voting_records.py [session_number]

# Fetch for a specific bill
docker compose exec backend python scrapers/fetch_voting_records.py [session_number] [bill_number]
```

**Note:** Run `fetch_bills.py` and `fetch_mps.py` first.

### 5. Fetch Speeches

```bash
# Fetch speeches for all active MPs
docker compose exec backend python scrapers/fetch_speeches.py [session_number]

# Fetch for a specific MP
docker compose exec backend python scrapers/fetch_speeches.py [session_number] [mp_id]
```

**Note:** Run `fetch_mps.py` first.

### 6. Fetch MP Financial Interests

```bash
# Fetch interests for all active MPs
docker compose exec backend python scrapers/fetch_interests.py

# Fetch for a specific MP
docker compose exec backend python scrapers/fetch_interests.py [mp_id]
```

**Note:** Run `fetch_mps.py` first.

### 7. Assign Topics to Bills

```bash
# Assign topics
docker compose exec backend python scrapers/assign_topics.py

# Clear existing and reassign
docker compose exec backend python scrapers/assign_topics.py --clear
```

**Note:** Run `fetch_bills.py` first.

## Recommended Order

For a fresh database, run in this order:

**Using the startup script (recommended):**

```bash
# From the project root
./start.sh scrapers 157
```

**Or run manually in Docker:**

```bash
# From the project root
docker compose exec backend bash -c "cd /app && ./scrapers/run_all.sh 157"
```

**Or run each step individually:**

```bash
# 1. Fetch parties (required for MPs)
docker compose exec backend python scrapers/fetch_parties.py 157

# 2. Fetch MPs (required for bills, speeches, votes, interests)
docker compose exec backend python scrapers/fetch_mps.py 157

# 3. Fetch bills (required for votes and speeches)
docker compose exec backend python scrapers/fetch_bills.py 157

# 4. Assign topics to bills
docker compose exec backend python scrapers/assign_topics.py

# 5. Fetch voting records
docker compose exec backend python scrapers/fetch_voting_records.py 157

# 6. Fetch speeches
docker compose exec backend python scrapers/fetch_speeches.py 157

# 7. Fetch MP interests
docker compose exec backend python scrapers/fetch_interests.py
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
   - Make sure you're running inside the Docker container
   - Make sure Django is properly configured
   - Verify the backend service is running: `docker compose ps`

5. **"Cannot connect to Docker daemon"**
   - Make sure Docker is running
   - Start services: `./start.sh dev -d` or `docker compose up -d`

### Logging

All errors are printed to stdout. You can redirect to a file:

```bash
docker compose exec backend python scrapers/fetch_bills.py 157 > fetch_bills.log 2>&1
```

## Notes

- All scripts are idempotent - you can run them multiple times safely
- Existing records will be updated, not duplicated
- Scripts use transactions to ensure data consistency
- Built-in delays prevent overwhelming the Alþingi API
- Session number must be specified (no default) - use 157 for 2025-2026 session

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

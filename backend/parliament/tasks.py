from celery import shared_task
import os
import sys
import subprocess
from parliament.models import ParliamentSession
from parliament.utils import get_active_session_number

def _run_scraper_script(script_name, session_number):
    """Run a scraper script as a subprocess"""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scraper_path = os.path.join(backend_dir, 'scrapers', f'{script_name}.py')
    
    if not os.path.exists(scraper_path):
        raise FileNotFoundError(f"Scraper script not found: {scraper_path}")
    
    # Run the scraper script
    result = subprocess.run(
        [sys.executable, scraper_path, str(session_number)],
        cwd=backend_dir,
        capture_output=True,
        text=True,
        timeout=3600  # 1 hour timeout
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"Scraper {script_name} failed: {result.stderr}")
    
    return result.stdout

@shared_task
def fetch_althingi_data(session_number=None):
    """
    Fetch all data from Althingi API
    
    Args:
        session_number: Parliament session number. If None, fetches the active session from Alþingi API.
    """
    # Get active session from Alþingi API if not specified
    if session_number is None:
        session_number = get_active_session_number()
        if session_number is None:
            return "Error: Could not determine active session from Alþingi API. Please specify a session number."
        print(f"Using active session from Alþingi API: {session_number}")
    
    try:
        # Fetch parties first as they are needed for MPs
        print("Fetching parties...")
        _run_scraper_script('fetch_parties', session_number)
        
        # Fetch MPs
        print("Fetching MPs...")
        _run_scraper_script('fetch_mps', session_number)
        
        # Fetch bills
        print("Fetching bills...")
        _run_scraper_script('fetch_bills', session_number)
        
        # Fetch speeches
        print("Fetching speeches...")
        _run_scraper_script('fetch_speeches', session_number)
        
        return f"Data fetch completed successfully for session {session_number}"
    except Exception as e:
        error_msg = f"Error fetching data for session {session_number}: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return error_msg

@shared_task
def fetch_voting_records(session_number=None):
    """
    Fetch voting records for the current session
    
    Args:
        session_number: Parliament session number. If None, fetches the active session from Alþingi API.
    """
    # Get active session from Alþingi API if not specified
    if session_number is None:
        session_number = get_active_session_number()
        if session_number is None:
            return "Error: Could not determine active session from Alþingi API. Please specify a session number."
        print(f"Using active session from Alþingi API: {session_number}")
    
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
        # Run the scraper script as a subprocess
        _run_scraper_script('fetch_voting_records', session_number)
        return f"Voting records fetch completed for session {session_number}"
    except ParliamentSession.DoesNotExist:
        return f"Session {session_number} not found"
    except Exception as e:
        error_msg = f"Error fetching voting records for session {session_number}: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return error_msg 
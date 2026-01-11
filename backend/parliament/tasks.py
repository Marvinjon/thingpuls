from celery import shared_task
import os
import sys
import importlib.util
from parliament.models import ParliamentSession
from parliament.utils import get_active_session_number

def _import_scraper_module(module_name):
    """Import a scraper module dynamically, handling the path correctly"""
    # Get the backend directory (parent of parliament)
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scraper_path = os.path.join(backend_dir, 'scrapers', f'{module_name}.py')
    
    if not os.path.exists(scraper_path):
        raise ImportError(f"Scraper module not found: {scraper_path}")
    
    spec = importlib.util.spec_from_file_location(module_name, scraper_path)
    module = importlib.util.module_from_spec(spec)
    # Execute the module (this will run django.setup() but it's idempotent)
    spec.loader.exec_module(module)
    return module

@shared_task
def fetch_althingi_data(session_number=None):
    """
    Fetch all data from Althingi API
    
    Args:
        session_number: Parliament session number. If None, fetches the active session from Alþingi API.
    """
    # Import scraper modules dynamically to avoid import-time Django setup conflicts
    fetch_parties_module = _import_scraper_module('fetch_parties')
    fetch_mps_module = _import_scraper_module('fetch_mps')
    fetch_bills_module = _import_scraper_module('fetch_bills')
    fetch_speeches_module = _import_scraper_module('fetch_speeches')
    
    fetch_parties = fetch_parties_module.fetch_parties
    fetch_mps = fetch_mps_module.fetch_mps
    fetch_bills = fetch_bills_module.fetch_bills
    fetch_all_mp_speeches = fetch_speeches_module.fetch_all_mp_speeches
    
    # Get active session from Alþingi API if not specified
    if session_number is None:
        session_number = get_active_session_number()
        if session_number is None:
            return "Error: Could not determine active session from Alþingi API. Please specify a session number."
        print(f"Using active session from Alþingi API: {session_number}")
    
    try:
        # Fetch parties first as they are needed for MPs
        print("Fetching parties...")
        fetch_parties(session_number)
        
        # Fetch MPs
        print("Fetching MPs...")
        fetch_mps(session_number)
        
        # Fetch bills
        print("Fetching bills...")
        fetch_bills(session_number)
        
        # Fetch speeches
        print("Fetching speeches...")
        fetch_all_mp_speeches(session_number)
        
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
    # Import scraper module dynamically to avoid import-time Django setup conflicts
    fetch_voting_records_module = _import_scraper_module('fetch_voting_records')
    fetch_all_voting_records = fetch_voting_records_module.fetch_all_voting_records
    
    # Get active session from Alþingi API if not specified
    if session_number is None:
        session_number = get_active_session_number()
        if session_number is None:
            return "Error: Could not determine active session from Alþingi API. Please specify a session number."
        print(f"Using active session from Alþingi API: {session_number}")
    
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
        fetch_all_voting_records(session_number, force=False)
        return f"Voting records fetch completed for session {session_number}"
    except ParliamentSession.DoesNotExist:
        return f"Session {session_number} not found"
    except Exception as e:
        error_msg = f"Error fetching voting records for session {session_number}: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return error_msg 
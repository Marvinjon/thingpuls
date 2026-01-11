from celery import shared_task
from parliament.models import ParliamentSession
from parliament.utils import get_active_session_number

# Import scraper functions
from scrapers.fetch_parties import fetch_parties
from scrapers.fetch_mps import fetch_mps
from scrapers.fetch_bills import fetch_bills
from scrapers.fetch_speeches import fetch_all_mp_speeches
from scrapers.fetch_voting_records import fetch_all_voting_records

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
        fetch_all_voting_records(session_number, force=False)
        return f"Voting records fetch completed for session {session_number}"
    except ParliamentSession.DoesNotExist:
        return f"Session {session_number} not found"
    except Exception as e:
        error_msg = f"Error fetching voting records for session {session_number}: {str(e)}"
        print(error_msg)
        return error_msg 
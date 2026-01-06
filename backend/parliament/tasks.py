from celery import shared_task
from django.core.management import call_command
from parliament.models import ParliamentSession

@shared_task
def fetch_althingi_data(session_number=None):
    """
    Fetch all data from Althingi API
    
    Args:
        session_number: Parliament session number. If None, uses the active session.
    """
    # Get active session if not specified
    if session_number is None:
        active_session = ParliamentSession.objects.filter(is_active=True).first()
        if not active_session:
            return "Error: No active session found. Please specify a session number."
        session_number = active_session.session_number
    
    # Fetch parties first as they are needed for MPs
    call_command('fetch_althingi_data', data_type='parties', session=session_number)
    
    # Fetch MPs
    call_command('fetch_althingi_data', data_type='mps', session=session_number)
    
    # Fetch bills
    call_command('fetch_althingi_data', data_type='bills', session=session_number)
    
    # Fetch speeches
    call_command('fetch_althingi_data', data_type='speeches', session=session_number)
    
    return f"Data fetch completed successfully for session {session_number}"

@shared_task
def fetch_voting_records(session_number=None):
    """
    Fetch voting records for the current session
    
    Args:
        session_number: Parliament session number. If None, uses the active session.
    """
    # Get active session if not specified
    if session_number is None:
        active_session = ParliamentSession.objects.filter(is_active=True).first()
        if not active_session:
            return "Error: No active session found. Please specify a session number."
        session_number = active_session.session_number
    
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
        call_command('fetch_voting_records', session=session_number, force=False)
        return f"Voting records fetch completed for session {session_number}"
    except ParliamentSession.DoesNotExist:
        return f"Session {session_number} not found" 
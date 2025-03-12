from celery import shared_task
from django.core.management import call_command
from parliament.models import ParliamentSession

@shared_task
def fetch_althingi_data():
    """
    Fetch all data from Althingi API
    """
    # Get current session (156 for now)
    session_number = 156
    
    # Fetch parties first as they are needed for MPs
    call_command('fetch_althingi_data', data_type='parties', session=session_number)
    
    # Fetch MPs
    call_command('fetch_althingi_data', data_type='mps', session=session_number)
    
    # Fetch bills
    call_command('fetch_althingi_data', data_type='bills', session=session_number)
    
    return "Data fetch completed successfully"

@shared_task
def fetch_voting_records():
    """
    Fetch voting records for the current session
    """
    session_number = 156
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
        call_command('fetch_voting_records', session=session_number, force=False)
        return f"Voting records fetch completed for session {session_number}"
    except ParliamentSession.DoesNotExist:
        return f"Session {session_number} not found" 
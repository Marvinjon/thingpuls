"""
Utility functions for parliament app.
"""
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from .models import ParliamentSession
from django.db import transaction


def parse_date(date_string):
    """Parse date string from Alþingi XML (format: DD.MM.YYYY)"""
    if not date_string:
        return None
    try:
        return datetime.strptime(date_string.strip(), '%d.%m.%Y').date()
    except (ValueError, TypeError):
        return None


def get_session_info_from_api(session_number):
    """
    Fetch session information (start_date, end_date) from Alþingi API.
    
    Args:
        session_number: The session number to fetch
        
    Returns:
        dict: Dictionary with 'start_date' and 'end_date' keys, or None if not found
    """
    try:
        url = 'https://www.althingi.is/altext/xml/loggjafarthing/'
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return None
        
        root = ET.fromstring(response.content)
        # Find the specific session
        thing_elem = root.find(f".//þing[@númer='{session_number}']")
        
        if thing_elem is not None:
            start_date_str = None
            end_date_str = None
            
            # Get start date (þingsetning)
            thingsetning_elem = thing_elem.find('þingsetning')
            if thingsetning_elem is not None and thingsetning_elem.text:
                start_date_str = thingsetning_elem.text.strip()
            
            # Get end date (þinglok) - may not exist for current session
            thinglok_elem = thing_elem.find('þinglok')
            if thinglok_elem is not None and thinglok_elem.text:
                end_date_str = thinglok_elem.text.strip()
            
            return {
                'start_date': parse_date(start_date_str),
                'end_date': parse_date(end_date_str) if end_date_str else None
            }
        
        return None
    except Exception as e:
        print(f'Error fetching session info for {session_number}: {str(e)}')
        return None


def get_active_session_number():
    """
    Fetch the currently active session number from Alþingi API.
    
    Returns:
        int: The session number of the currently active session, or None if not found
    """
    try:
        url = 'https://www.althingi.is/altext/xml/loggjafarthing/yfirstandandi/'
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return None
        
        root = ET.fromstring(response.content)
        thing_elem = root.find('.//þing')
        
        if thing_elem is not None:
            # Try different attribute names (the XML uses 'númer' with umlaut)
            session_number = thing_elem.get('númer') or thing_elem.get('nummer')
            if session_number:
                try:
                    return int(session_number)
                except (ValueError, TypeError):
                    pass
        
        return None
    except Exception as e:
        print(f'Error fetching active session: {str(e)}')
        return None


def update_active_session_status():
    """
    Update the is_active status for all sessions based on the Alþingi API.
    Only the session returned by the API will be marked as active.
    """
    active_session_number = get_active_session_number()
    
    if active_session_number is None:
        print('Warning: Could not determine active session from Alþingi API')
        return None
    
    with transaction.atomic():
        # Set all sessions to inactive
        ParliamentSession.objects.all().update(is_active=False)
        
        # Set the active session
        try:
            active_session = ParliamentSession.objects.get(session_number=active_session_number)
            active_session.is_active = True
            active_session.save()
            print(f'Updated active session to: {active_session_number}')
            return active_session
        except ParliamentSession.DoesNotExist:
            print(f'Warning: Session {active_session_number} not found in database')
            return None


def get_or_create_session(session_number, update_active_status=True):
    """
    Get or create a ParliamentSession, and optionally update active status.
    Fetches start_date and end_date from Alþingi API.
    
    Args:
        session_number: The session number
        update_active_status: If True, updates which session is active based on API
    
    Returns:
        ParliamentSession: The session object
    """
    if update_active_status:
        update_active_session_status()
    
    # Get active session number to set is_active correctly
    active_session_number = get_active_session_number()
    is_active = (active_session_number == session_number) if active_session_number else False
    
    # Fetch session info from API
    session_info = get_session_info_from_api(session_number)
    
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
        # Update dates if we got them from API and they're different
        if session_info:
            updated = False
            if session_info['start_date'] and session.start_date != session_info['start_date']:
                session.start_date = session_info['start_date']
                updated = True
            if session_info['end_date'] is not None and session.end_date != session_info['end_date']:
                session.end_date = session_info['end_date']
                updated = True
            if session.is_active != is_active:
                session.is_active = is_active
                updated = True
            if updated:
                session.save()
        return session
    except ParliamentSession.DoesNotExist:
        # Create new session with dates from API
        start_date = session_info['start_date'] if session_info and session_info['start_date'] else datetime.now().date()
        end_date = session_info['end_date'] if session_info else None
        
        session = ParliamentSession.objects.create(
            session_number=session_number,
            start_date=start_date,
            end_date=end_date,
            is_active=is_active
        )
        return session

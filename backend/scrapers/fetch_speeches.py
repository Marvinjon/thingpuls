"""
Fetch speeches from Alþingi API
Simple script to fetch and save MP speech data
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys
import django
from django.db import transaction, models
from django.utils import timezone

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import MP, Bill, Speech, ParliamentSession


def parse_date(date_string):
    """Parse date string from Alþingi XML"""
    if not date_string:
        return None
    
    try:
        formats = ['%d.%m.%Y', '%Y-%m-%d']
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt).date()
            except ValueError:
                continue
        return None
    except Exception:
        return None


def fetch_mp_speeches(mp_id, session_number):
    """Fetch speeches for a specific MP from Alþingi XML API"""
    print(f'\nFetching speeches for MP ID {mp_id}...')
    
    # Get the session object
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
    except ParliamentSession.DoesNotExist:
        print(f'Creating session {session_number}...')
        session = ParliamentSession.objects.create(
            session_number=session_number,
            start_date=datetime.now().date(),
            is_active=True
        )
    
    # Get the MP object
    try:
        mp = MP.objects.get(althingi_id=mp_id)
    except MP.DoesNotExist:
        print(f'Error: MP with ID {mp_id} does not exist')
        return
    
    # URL for speeches for this MP
    url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/raedur/?nr={mp_id}'
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f'Error fetching speeches: HTTP {response.status_code}')
            return
        
        # Parse XML content
        root = ET.fromstring(response.content)
        
        speeches_created = 0
        speeches_updated = 0
        speech_count = 0
        
        # Find all speech elements
        for speech_elem in root.findall('.//ræða'):
            try:
                # Get parliament session for this speech
                session_elem = speech_elem.find('löggjafarþing')
                
                if session_elem is None or not session_elem.text:
                    continue
                
                # Skip speeches from other sessions
                if int(session_elem.text) != session_number:
                    continue
                
                # Get speech date
                date_elem = speech_elem.find('dagur')
                if date_elem is None or not date_elem.text:
                    continue
                
                speech_date = parse_date(date_elem.text)
                if not speech_date:
                    continue
                
                # Get speech type
                speech_type_elem = speech_elem.find('tegundræðu')
                speech_type = speech_type_elem.text if speech_type_elem is not None and speech_type_elem.text else ''
                
                # Get times
                start_time_elem = speech_elem.find('ræðahófst')
                end_time_elem = speech_elem.find('ræðulauk')
                
                start_time = None
                end_time = None
                duration = None
                
                if start_time_elem is not None and start_time_elem.text:
                    try:
                        naive_start_time = datetime.fromisoformat(start_time_elem.text)
                        start_time = timezone.make_aware(naive_start_time, timezone=timezone.get_current_timezone())
                    except ValueError:
                        pass
                
                if end_time_elem is not None and end_time_elem.text:
                    try:
                        naive_end_time = datetime.fromisoformat(end_time_elem.text)
                        end_time = timezone.make_aware(naive_end_time, timezone=timezone.get_current_timezone())
                        
                        if start_time and end_time:
                            duration = (end_time - start_time).total_seconds()
                    except ValueError:
                        pass
                
                # Get bill information
                bill_elem = speech_elem.find('mál')
                bill_id = None
                bill_obj = None
                title = ''
                
                if bill_elem is not None:
                    bill_id_elem = bill_elem.find('málsnúmer')
                    bill_title_elem = bill_elem.find('málsheiti')
                    
                    if bill_id_elem is not None and bill_id_elem.text:
                        try:
                            bill_id = int(bill_id_elem.text)
                            
                            # Try to find the bill
                            try:
                                bill_obj = Bill.objects.get(althingi_id=bill_id, session=session)
                            except Bill.DoesNotExist:
                                pass
                        except ValueError:
                            pass
                    
                    if bill_title_elem is not None and bill_title_elem.text:
                        title = bill_title_elem.text.strip()
                
                # Get URLs
                audio_url = ''
                xml_url = ''
                html_url = ''
                
                slodirs_elem = speech_elem.find('slóðir')
                if slodirs_elem is not None:
                    audio_elem = slodirs_elem.find('hljóð')
                    if audio_elem is not None and audio_elem.text:
                        audio_url = audio_elem.text
                    
                    xml_elem = slodirs_elem.find('xml')
                    if xml_elem is not None and xml_elem.text:
                        xml_url = xml_elem.text
                    
                    html_elem = slodirs_elem.find('html')
                    if html_elem is not None and html_elem.text:
                        html_url = html_elem.text
                
                # Create or update the speech in the database
                if speech_date and start_time:
                    with transaction.atomic():
                        speech, created = Speech.objects.update_or_create(
                            mp=mp,
                            session=session,
                            date=speech_date,
                            start_time=start_time,
                            defaults={
                                'bill': bill_obj,
                                'mp_althingi_id': mp_id,
                                'althingi_bill_id': bill_id,
                                'title': title,
                                'speech_type': speech_type,
                                'end_time': end_time,
                                'duration': duration,
                                'audio_url': audio_url,
                                'xml_url': xml_url,
                                'html_url': html_url
                            }
                        )
                        
                        if created:
                            speeches_created += 1
                            print(f'  ✓ Created speech: {speech_date}, {speech_type}')
                        else:
                            speeches_updated += 1
                            print(f'  ✓ Updated speech: {speech_date}, {speech_type}')
                        
                        speech_count += 1
            
            except Exception as e:
                print(f'  ✗ Error processing speech: {str(e)}')
                continue
        
        # Calculate total speaking time from all speeches
        total_speaking_time = Speech.objects.filter(mp_althingi_id=mp_id).aggregate(
            total_time=models.Sum('duration')
        )['total_time'] or 0
        
        # Update both speech count and total speaking time
        mp.speech_count = speech_count
        mp.total_speaking_time = total_speaking_time
        mp.save(update_fields=['speech_count', 'total_speaking_time'])
        
        print(f'\n=== Summary for {mp.full_name} ===')
        print(f'Speeches created: {speeches_created}')
        print(f'Speeches updated: {speeches_updated}')
        print(f'Total speeches: {speech_count}')
        print(f'Total speaking time: {total_speaking_time} seconds ({total_speaking_time / 60:.1f} minutes)')
    
    except requests.RequestException as e:
        print(f'Error fetching speeches: {str(e)}')
    except ET.ParseError as e:
        print(f'Error parsing XML: {str(e)}')
    except Exception as e:
        print(f'Unexpected error: {str(e)}')


def fetch_all_mp_speeches(session_number):
    """Fetch speeches for all active MPs"""
    print(f'Fetching speeches for all active MPs in session {session_number}...')
    
    mps = MP.objects.filter(active=True)
    total_mps = mps.count()
    
    print(f'Found {total_mps} active MPs')
    
    for idx, mp in enumerate(mps, 1):
        print(f'\n[{idx}/{total_mps}] Processing MP: {mp.full_name}')
        fetch_mp_speeches(mp.althingi_id, session_number)
    
    print(f'\n=== All Done ===')
    print(f'Processed speeches for {total_mps} MPs')


if __name__ == '__main__':
    # Get session number from command line (required)
    if len(sys.argv) < 2:
        print('Error: Session number is required')
        print('Usage: python fetch_speeches.py <session_number> [mp_id]')
        print('Example: python fetch_speeches.py 157')
        print('Example: python fetch_speeches.py 157 1234')
        sys.exit(1)
    
    session = int(sys.argv[1])
    
    # Check if a specific MP ID is provided
    if len(sys.argv) > 2:
        mp_id = int(sys.argv[2])
        fetch_mp_speeches(mp_id, session)
    else:
        fetch_all_mp_speeches(session)


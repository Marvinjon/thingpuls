"""
Fetch voting records from Alþingi API
Simple script to fetch and save voting records for bills
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import time
import os
import sys
import django
from django.db import transaction

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import Bill, MP, Vote, ParliamentSession


def make_request(url, max_retries=3, timeout=10):
    """Make a request with timeout and retry logic"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except (requests.RequestException, requests.Timeout) as e:
            if attempt < max_retries - 1:
                print(f'  Warning: Request failed ({attempt+1}/{max_retries}): {str(e)}')
                time.sleep(2)
            else:
                print(f'  Error: Request failed after {max_retries} retries: {str(e)}')
                return None
    return None


def fetch_bill_voting_records(session, bill_number, force=False):
    """Fetch voting records for a specific bill"""
    print(f'\nFetching voting records for bill {bill_number}...')
    
    try:
        # Get the bill details
        bill_details_url = f'https://www.althingi.is/altext/xml/thingmalalisti/thingmal/?lthing={session.session_number}&malnr={bill_number}'
        
        bill_response = make_request(bill_details_url)
        if not bill_response:
            print(f'  Error: Failed to fetch details for bill {bill_number}')
            return
        
        root = ET.fromstring(bill_response.content)
        
        # Get or create the bill
        bill_title_elem = root.find('.//málsheiti')
        if bill_title_elem is None:
            print(f'  Error: Could not find title for bill {bill_number}')
            return
        
        bill_title = bill_title_elem.text
        bill_obj, created = Bill.objects.get_or_create(
            althingi_id=bill_number,
            session=session,
            defaults={
                'title': bill_title,
                'slug': f'{session.session_number}-{bill_number}',
                'introduced_date': datetime.now().date(),
            }
        )
        
        # Find all voting records for this bill
        voting_records = root.findall('.//atkvæðagreiðsla')
        if not voting_records:
            print(f'  No voting records found for bill {bill_number}')
            return
        
        # Only process the LAST voting record (final vote)
        # This is the final vote when the bill is passed or rejected
        last_voting_record = voting_records[-1]
        voting_id = last_voting_record.get('atkvæðagreiðslunúmer')
        
        if not voting_id:
            print(f'  Error: Could not find voting ID for final vote')
            return
        
        print(f'  Processing final vote (ID: {voting_id}, total votes available: {len(voting_records)})')
        
        votes_created_total = 0
        
        # Fetch the actual voting details
        voting_details_url = f'https://www.althingi.is/altext/xml/atkvaedagreidslur/atkvaedagreidsla/?numer={voting_id}'
        
        voting_details_response = make_request(voting_details_url)
        if not voting_details_response:
            print(f'  Error: Failed to fetch voting details for ID {voting_id}')
            return
        
        voting_root = ET.fromstring(voting_details_response.content)
        
        # Get voting date
        date_elem = voting_root.find('.//tími')
        if date_elem is None or not date_elem.text:
            print(f'  Warning: Could not find date for voting session {voting_id}')
            return
        
        vote_date = datetime.strptime(date_elem.text.split('T')[0], '%Y-%m-%d').date()
        
        # Check if we already have this voting session
        if not force and Vote.objects.filter(bill=bill_obj, althingi_voting_id=voting_id).exists():
            print(f'  Skipping: Voting records for ID {voting_id} already exist (use force=True to update)')
            return
        
        # Extract the result
        result = 'unknown'
        result_elem = voting_root.find('.//niðurstaða')
        if result_elem is not None and result_elem.text:
            if 'samþykkt' in result_elem.text.lower():
                result = 'passed'
                bill_obj.status = 'passed'
            elif 'fellt' in result_elem.text.lower():
                result = 'rejected'
                bill_obj.status = 'rejected'
            bill_obj.save()
        
        # Process individual votes
        with transaction.atomic():
            # Delete existing votes for this bill if updating
            Vote.objects.filter(bill=bill_obj).delete()
            
            # Find all MP votes
            mp_votes = voting_root.findall('.//þingmaður')
            
            votes_created = 0
            for mp_elem in mp_votes:
                mp_id = mp_elem.get('id')
                vote_elem = mp_elem.find('atkvæði')
                
                if not mp_id or vote_elem is None:
                    continue
                
                vote_value = vote_elem.text
                if not vote_value:
                    continue
                
                # Map Althingi vote values to our model's values
                vote_mapping = {
                    'já': 'yes',
                    'nei': 'no',
                    'greiðir ekki atkvæði': 'abstain',
                    'fjarverandi': 'absent',
                    'boðaði fjarvist': 'absent'
                }
                
                vote_value = vote_mapping.get(vote_value.lower(), 'abstain')
                
                try:
                    mp = MP.objects.get(althingi_id=mp_id)
                    Vote.objects.create(
                        bill=bill_obj,
                        mp=mp,
                        vote=vote_value.lower(),
                        vote_date=vote_date,
                        session=session,
                        althingi_voting_id=voting_id
                    )
                    votes_created += 1
                except MP.DoesNotExist:
                    name_elem = mp_elem.find('nafn')
                    name = name_elem.text if name_elem is not None else "Unknown"
                    print(f'  Warning: MP with ID {mp_id} ({name}) not found')
            
            votes_created_total = votes_created
            print(f'  ✓ Created {votes_created} votes for final vote on {vote_date}')
        
        print(f'  Summary: {votes_created_total} votes created for bill {bill_number} (voting ID: {voting_id})')
        
    except ET.ParseError as e:
        print(f'  Error: XML parsing error: {str(e)}')
    except Exception as e:
        print(f'  Error: Unexpected error: {str(e)}')


def fetch_all_voting_records(session_number, force=False):
    """Fetch voting records for all bills in a session"""
    print(f'Fetching voting records for session {session_number}...')
    
    # Get or create session
    try:
        session = ParliamentSession.objects.get(session_number=session_number)
    except ParliamentSession.DoesNotExist:
        print(f'Creating session {session_number}...')
        session = ParliamentSession.objects.create(
            session_number=session_number,
            start_date=datetime.now().date(),
            is_active=True
        )
    
    # Get the list of bills for this session
    url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session_number}'
    
    try:
        response = make_request(url)
        if not response:
            print('Error: Failed to fetch bill list')
            return
        
        root = ET.fromstring(response.content)
        bills = root.findall('.//mál')
        
        print(f'Found {len(bills)} bills')
        
        bills_processed = 0
        for bill in bills:
            try:
                # Extract bill number from URL
                html_elem = bill.find('html')
                if html_elem is None or not html_elem.text:
                    continue
                
                import re
                url_match = re.search(r'mnr=(\d+)', html_elem.text)
                if not url_match:
                    continue
                
                bill_id = url_match.group(1)
                
                # Get the bill title
                title_elem = bill.find('málsheiti')
                title = title_elem.text if title_elem is not None else "Unknown title"
                
                print(f'\n[{bills_processed + 1}/{len(bills)}] Processing bill {bill_id}: {title[:60]}...')
                
                # Process the bill
                fetch_bill_voting_records(session, bill_id, force)
                bills_processed += 1
                
                # Add delay between bills
                time.sleep(0.5)
                
            except Exception as e:
                print(f'  Error processing bill: {str(e)}')
                continue
        
        print(f'\n=== Summary ===')
        print(f'Bills processed: {bills_processed}')
        
    except requests.RequestException as e:
        print(f'Error fetching bill list: {str(e)}')
    except ET.ParseError as e:
        print(f'Error parsing XML: {str(e)}')
    except Exception as e:
        print(f'Unexpected error: {str(e)}')


if __name__ == '__main__':
    # Get session number from command line (required)
    if len(sys.argv) < 2:
        print('Error: Session number is required')
        print('Usage: python fetch_voting_records.py <session_number> [bill_number]')
        print('Example: python fetch_voting_records.py 157')
        print('Example: python fetch_voting_records.py 157 1')
        sys.exit(1)
    
    session = int(sys.argv[1])
    
    # Check if a specific bill number is provided
    if len(sys.argv) > 2:
        bill_number = int(sys.argv[2])
        session_obj = ParliamentSession.objects.get_or_create(
            session_number=session,
            defaults={'start_date': datetime.now().date(), 'is_active': True}
        )[0]
        fetch_bill_voting_records(session_obj, bill_number, force=True)
    else:
        fetch_all_voting_records(session, force=False)


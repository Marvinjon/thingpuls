"""
Fetch bills from Alþingi API
Simple script to fetch and save bill data
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys
import django
from django.utils.text import slugify
from django.db import transaction
import html

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import Bill, MP, ParliamentSession
from parliament.utils import get_or_create_session


def map_bill_status(status_text):
    """Map Alþingi bill status to our model's status choices"""
    # For fyrirspurn (questions), check for unanswered first (more specific)
    if 'hefur ekki verið svarað' in status_text or 'ekki verið svarað' in status_text:
        return 'question_sent'
    
    status_map = {
        # Regular bill statuses
        'Bíður fyrri umræðu': 'awaiting_first_reading',
        'Bíða 1. umræðu': 'awaiting_first_reading',
        'Vísað til nefndar': 'in_committee',
        'Í nefnd': 'in_committee',
        'Bíður síðari umræðu': 'awaiting_second_reading',
        'Bíða 2. umræðu': 'awaiting_second_reading',
        'Bíður þriðju umræðu': 'awaiting_third_reading',
        'Bíða 3. umræðu': 'awaiting_third_reading',
        'Samþykkt': 'passed',
        'Fellt': 'rejected',
        'Dregið til baka': 'withdrawn',
        # Fyrirspurn (written question) statuses
        # "svarað" covers both "svarað skriflega" and "svarað munnlega"
        'svarað': 'question_answered',
        'Fyrirspurn': 'question_sent'  # Just the question sent (fallback)
    }
    
    for key, value in status_map.items():
        if key in status_text:
            return value
    
    return 'awaiting_first_reading'  # Default status


def map_bill_type(bill_type_text):
    """
    Map Alþingi bill type to our model's bill type choices.
    
    The <heiti> element inside <málstegund> contains values like:
    - "Frumvarp til laga" -> frumvarp (bills)
    - "Þingsályktunartillaga" -> thingsalyktun (resolutions)
    - "Fyrirspurn" -> fyrirspurn (questions)
    """
    bill_type_lower = bill_type_text.lower()
    
    # Check for specific types first (order matters!)
    # Check for resolutions first (þingsályktunartillaga)
    if 'þingsályktun' in bill_type_lower or 'þingsályktunar' in bill_type_lower:
        return 'thingsalyktun'
    
    # Check for questions (fyrirspurn)
    if 'fyrirspurn' in bill_type_lower:
        return 'fyrirspurn'
    
    # If it contains "frumvarp" or "laga", it's a bill
    if 'frumvarp' in bill_type_lower or 'laga' in bill_type_lower:
        return 'frumvarp'
    
    # Default to frumvarp if we can't determine
    return 'frumvarp'


def determine_submitter_type(bill_type_text, sponsors_count):
    """
    Determine submitter type based on bill type text.
    
    The málstegund field contains:
    - "Stjórnarfrumvarp til laga" -> government
    - "Þingmannafrumvarp til laga" -> member
    - "Nefndarfrumvarp til laga" -> committee
    """
    bill_type_lower = bill_type_text.lower()
    
    # Check for specific submitter types
    if 'stjórnar' in bill_type_lower:
        return 'government'
    elif 'nefndar' in bill_type_lower:
        return 'committee'
    elif 'þingmanna' in bill_type_lower or 'þingmanns' in bill_type_lower:
        return 'member'
    
    # For other types (resolutions, questions), default to member
    return 'member'


def determine_submitter_type_from_skjalategund(skjalategund):
    """
    Determine submitter type from the þingskjal's skjalategund attribute.
    
    Examples:
    - "stjórnarfrumvarp" -> government
    - "frumvarp" -> member
    - "nefndarfrumvarp" -> committee
    """
    skjalategund_lower = skjalategund.lower()
    
    if 'stjórnar' in skjalategund_lower:
        return 'government'
    elif 'nefndar' in skjalategund_lower:
        return 'committee'
    else:
        # Default to member for regular bills, resolutions, and questions
        return 'member'


def process_bill_sponsors(bill_obj, root, session):
    """Process sponsors and co-sponsors for a bill"""
    try:
        # Find the first document (þingskjal) which is usually the bill itself
        first_doc = root.find(".//þingskjöl/þingskjal")
        if first_doc is None:
            return
        
        # Get document number and fetch its details
        doc_number = first_doc.get("skjalsnúmer")
        if not doc_number:
            return
        
        # Fetch document details
        url = f'https://www.althingi.is/altext/xml/thingskjol/thingskjal/?lthing={session.session_number}&skjalnr={doc_number}'
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f'  Warning: Error fetching document {doc_number}: HTTP {response.status_code}')
                return
            
            # Parse document XML
            doc_root = ET.fromstring(response.content)
            
            # Find sponsors element
            sponsors_elem = doc_root.find(".//flutningsmenn")
            if sponsors_elem is None:
                return
            
            # Clear existing sponsors
            bill_obj.sponsors.clear()
            bill_obj.cosponsors.clear()
            
            # Process each sponsor
            for idx, sponsor_elem in enumerate(sponsors_elem.findall(".//flutningsmaður")):
                mp_id = sponsor_elem.get("id")
                if not mp_id:
                    continue
                
                try:
                    mp = MP.objects.get(althingi_id=mp_id)
                    
                    # First sponsor is the main sponsor, others are co-sponsors
                    if idx == 0:
                        bill_obj.sponsors.add(mp)
                        # Update MP's sponsored bills count
                        mp.bills_sponsored = Bill.objects.filter(sponsors=mp).count()
                        mp.save(update_fields=['bills_sponsored'])
                        print(f'  + Primary sponsor: {mp.full_name}')
                    else:
                        bill_obj.cosponsors.add(mp)
                        # Update MP's co-sponsored bills count
                        mp.bills_cosponsored = Bill.objects.filter(cosponsors=mp).count()
                        mp.save(update_fields=['bills_cosponsored'])
                        print(f'  + Co-sponsor: {mp.full_name}')
                        
                except MP.DoesNotExist:
                    print(f'  Warning: MP with ID {mp_id} not found')
                    continue
                
        except requests.RequestException as e:
            print(f'  Warning: Error fetching document: {str(e)}')
        except ET.ParseError as e:
            print(f'  Warning: Error parsing document XML: {str(e)}')
            
    except Exception as e:
        print(f'  Warning: Error processing bill sponsors: {str(e)}')


def fetch_bills(session_number):
    """Fetch bills from Alþingi XML API"""
    print(f'Fetching bills for session {session_number}...')
    
    # Get or create session (will update active status automatically)
    session = get_or_create_session(session_number, update_active_status=True)
    
    bills_created = 0
    bills_updated = 0
    empty_bill_count = 0
    bill_number = 1
    
    # Continue fetching until we find 8 consecutive empty bills
    while empty_bill_count < 8:
        try:
            # Fetch individual bill data
            url = f'https://www.althingi.is/altext/xml/thingmalalisti/thingmal/?lthing={session_number}&malnr={bill_number}'
            response = requests.get(url)
            
            if response.status_code != 200:
                empty_bill_count += 1
                bill_number += 1
                continue
            
            # Parse XML
            try:
                root = ET.fromstring(response.content)
                
                # Check if this is an empty bill
                bill_element = root.find(".//mál")
                if bill_element is None:
                    empty_bill_count += 1
                    bill_number += 1
                    continue
                
                # Check for empty bill structure
                is_empty = True
                required_empty_elements = [
                    ".//þingskjöl",
                    ".//atkvæðagreiðslur",
                    ".//umsagnabeiðnir[@frestur='']",
                    ".//erindaskrá",
                    ".//ræður"
                ]
                
                for elem_path in required_empty_elements:
                    elem = root.find(elem_path)
                    if elem is not None and len(elem) > 0:
                        is_empty = False
                        break
                
                if is_empty:
                    empty_bill_count += 1
                    bill_number += 1
                    continue
                else:
                    empty_bill_count = 0  # Reset counter when we find a valid bill
                
                # Extract basic bill information
                title = root.find(".//málsheiti")
                bill_type_elem = root.find(".//málstegund")
                status = root.find(".//staðamáls")
                
                # Skip if no title
                if title is None or not title.text:
                    print(f'  Warning: Skipping bill {bill_number} - No title found')
                    bill_number += 1
                    continue
                
                title_text = html.unescape(title.text.strip())
                
                # Extract bill type from the <heiti> child element of <málstegund>
                bill_type_text = "Unknown"
                if bill_type_elem is not None:
                    heiti = bill_type_elem.find("heiti")
                    if heiti is not None and heiti.text:
                        bill_type_text = html.unescape(heiti.text.strip())
                
                status_text = html.unescape(status.text.strip()) if status is not None and status.text else "Unknown"
                
                # Create a unique slug
                base_slug = slugify(title_text)[:180]
                slug = base_slug
                counter = 1
                while Bill.objects.filter(session=session, slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Find document info for introduced date
                doc_info = root.find(".//þingskjal")
                introduced_date = None
                if doc_info is not None:
                    distribution = doc_info.find("útbýting")
                    if distribution is not None and distribution.text:
                        try:
                            date_text = distribution.text.split()[0]
                            introduced_date = datetime.strptime(date_text, '%Y-%m-%d').date()
                        except (ValueError, IndexError):
                            pass
                
                # Extract vote date from the last voting record (final vote)
                vote_date = None
                voting_records = root.findall('.//atkvæðagreiðsla')
                if voting_records:
                    # Get the last voting record (final vote)
                    last_vote = voting_records[-1]
                    vote_time = last_vote.find('tími')
                    if vote_time is not None and vote_time.text:
                        try:
                            # Extract date from datetime string (format: YYYY-MM-DDTHH:MM:SS)
                            date_text = vote_time.text.split('T')[0]
                            vote_date = datetime.strptime(date_text, '%Y-%m-%d').date()
                        except (ValueError, IndexError):
                            pass
                
                # Create or update the bill
                with transaction.atomic():
                    # Extract submitter type from the first þingskjal's skjalategund child element
                    submitter_type = 'member'  # default
                    first_thingskjal = root.find(".//þingskjal")
                    if first_thingskjal is not None:
                        skjalategund_elem = first_thingskjal.find("skjalategund")
                        if skjalategund_elem is not None and skjalategund_elem.text:
                            skjalategund = html.unescape(skjalategund_elem.text.strip())
                            submitter_type = determine_submitter_type_from_skjalategund(skjalategund)
                    
                    bill, created = Bill.objects.update_or_create(
                        althingi_id=bill_number,
                        session=session,
                        defaults={
                            'title': title_text,
                            'slug': slug,
                            'description': f"{bill_type_text} - {status_text}",
                            'status': map_bill_status(status_text),
                            'bill_type': map_bill_type(bill_type_text),
                            'submitter_type': submitter_type,
                            'introduced_date': introduced_date or session.start_date,
                            'vote_date': vote_date,  # Add vote date
                            'url': f'https://www.althingi.is/thingstorf/thingmalalistar-eftir-thingum/ferill/?ltg={session_number}&mnr={bill_number}'
                        }
                    )
                    
                    # Process sponsors and co-sponsors
                    process_bill_sponsors(bill, root, session)
                    
                    if created:
                        bills_created += 1
                        print(f'✓ Created bill {bill_number}: {title_text[:60]}...')
                    else:
                        bills_updated += 1
                        print(f'✓ Updated bill {bill_number}: {title_text[:60]}...')
                
                bill_number += 1
            
            except ET.ParseError as e:
                print(f'Warning: XML parsing error for bill {bill_number}: {str(e)}')
                bill_number += 1
                continue
                
        except Exception as e:
            print(f'✗ Error processing bill {bill_number}: {str(e)}')
            bill_number += 1
            continue
    
    print(f'\n=== Summary ===')
    print(f'Bills created: {bills_created}')
    print(f'Bills updated: {bills_updated}')
    print(f'Total: {bills_created + bills_updated}')
    
    # Automatically assign topics after fetching bills
    print(f'\n=== Assigning Topics ===')
    try:
        # Import assign_topics function from the same directory
        import importlib.util
        scrapers_dir = os.path.dirname(os.path.abspath(__file__))
        assign_topics_path = os.path.join(scrapers_dir, 'assign_topics.py')
        spec = importlib.util.spec_from_file_location("assign_topics", assign_topics_path)
        assign_topics_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(assign_topics_module)
        assign_topics_module.assign_topics(clear_existing=False, session=session_number)
        print('✓ Topics assigned successfully')
    except Exception as e:
        print(f'Warning: Could not assign topics: {str(e)}')
        print(f'You can manually run: python scrapers/assign_topics.py --session {session_number}')


if __name__ == '__main__':
    # Get session number from command line (required)
    if len(sys.argv) < 2:
        print('Error: Session number is required')
        print('Usage: python fetch_bills.py <session_number>')
        print('Example: python fetch_bills.py 157')
        sys.exit(1)
    
    session = int(sys.argv[1])
    fetch_bills(session)


"""
Fetch MP financial interests from Alþingi API
Simple script to fetch and save MP financial interests and commitments
"""

import requests
import xml.etree.ElementTree as ET
import re
import os
import sys
import django
from django.db import transaction
import html

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import MP, MPInterest


def clean_text(text):
    """Clean up interest text data"""
    if not text:
        return ""
    
    # Only return empty string if the text is exactly one of these words
    if re.match(r'^\s*(Engin|Engar|Ekkert|None)\s*\.?\s*$', text, re.IGNORECASE):
        return ""
    
    # Remove field descriptions that might be included
    text = re.sub(r'^Launuð stjórnarseta[^.]*\.\s*', '', text)
    text = re.sub(r'^Launað starf[^.]*\.\s*', '', text)
    text = re.sub(r'^Starfsemi sem unnin er[^.]*\.\s*', '', text)
    text = re.sub(r'^Fjárframlag eða annar[^.]*\.\s*', '', text)
    text = re.sub(r'^Gjöf frá innlendum[^.]*\.\s*', '', text)
    text = re.sub(r'^Ferðir og heimsóknir[^.]*\.\s*', '', text)
    text = re.sub(r'^Eftirgjöf eftirstöðva[^.]*\.\s*', '', text)
    text = re.sub(r'^Fasteign, sem er[^.]*\.\s*', '', text)
    text = re.sub(r'^Heiti félags[^.]*\.\s*', '', text)
    text = re.sub(r'^Samkomulag við fyrrverandi[^.]*\.\s*', '', text)
    text = re.sub(r'^Samkomulag um ráðningu[^.]*\.\s*', '', text)
    text = re.sub(r'^Skrá skal upplýsingar[^.]*\.\s*', '', text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Decode HTML entities (including &ndash;, &mdash;, &#10;, etc.)
    text = html.unescape(text)
    
    # Convert newlines
    text = text.replace('\n', ' ')
    
    return text.strip()


def get_text_from_element(root, tag_name):
    """Get text from XML element"""
    try:
        element = root.find(f'.//{tag_name}')
        if element is not None:
            svar_elem = element.find('svar')
            if svar_elem is not None and svar_elem.text:
                return svar_elem.text.strip()
        return ""
    except Exception:
        return ""


def fetch_mp_interests(mp_id):
    """Fetch financial interests for a specific MP from Alþingi XML API"""
    print(f'\nFetching interests for MP ID {mp_id}...')
    
    # Get the MP object
    try:
        mp = MP.objects.get(althingi_id=mp_id)
    except MP.DoesNotExist:
        print(f'Error: MP with ID {mp_id} does not exist')
        return
    
    # URL for interests for this MP
    url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/hagsmunir/?nr={mp_id}'
    source_url = f'https://www.althingi.is/altext/hagsmunir/?faerslunr={mp_id}'
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f'Error fetching interests: HTTP {response.status_code}')
            return
        
        # Parse XML content
        root = ET.fromstring(response.content)
        
        # Extract data using helper function
        board_positions = clean_text(get_text_from_element(root, 'launuðstjórnarseta'))
        paid_work = clean_text(get_text_from_element(root, 'launaðstarf'))
        business_activities = clean_text(get_text_from_element(root, 'tekjumyndandistarfsemi'))
        financial_support = clean_text(get_text_from_element(root, 'fjárhagslegurstuðningur'))
        gifts = clean_text(get_text_from_element(root, 'gjafir'))
        trips = clean_text(get_text_from_element(root, 'ferðir'))
        debt_forgiveness = clean_text(get_text_from_element(root, 'eftirgjöfskulda'))
        real_estate = clean_text(get_text_from_element(root, 'fasteignir'))
        company_ownership = clean_text(get_text_from_element(root, 'eignir'))
        former_employer_agreements = clean_text(get_text_from_element(root, 'fyrrverandivinnuveitandi'))
        future_employer_agreements = clean_text(get_text_from_element(root, 'framtíðarvinnuveitandi'))
        other_positions = clean_text(get_text_from_element(root, 'trúnaðarstörf'))
        
        # Count filled fields
        filled_fields = sum(1 for field in [
            board_positions, paid_work, business_activities, financial_support,
            gifts, trips, debt_forgiveness, real_estate, company_ownership,
            former_employer_agreements, future_employer_agreements, other_positions
        ] if field)
        
        print(f'  Found data for {filled_fields} out of 12 interest fields')
        
        # Create or update the MP's interests
        with transaction.atomic():
            interest, created = MPInterest.objects.update_or_create(
                mp=mp,
                defaults={
                    'board_positions': board_positions,
                    'paid_work': paid_work,
                    'business_activities': business_activities,
                    'financial_support': financial_support,
                    'gifts': gifts,
                    'trips': trips,
                    'debt_forgiveness': debt_forgiveness,
                    'real_estate': real_estate,
                    'company_ownership': company_ownership,
                    'former_employer_agreements': former_employer_agreements,
                    'future_employer_agreements': future_employer_agreements,
                    'other_positions': other_positions,
                    'source_url': source_url
                }
            )
            
            if created:
                print(f'  ✓ Created interests for MP: {mp.full_name}')
            else:
                print(f'  ✓ Updated interests for MP: {mp.full_name}')
            
            # Log some key information
            if company_ownership:
                print(f'    - Company Ownership: {company_ownership[:80]}...')
            if business_activities:
                print(f'    - Business Activities: {business_activities[:80]}...')
            if board_positions:
                print(f'    - Board Positions: {board_positions[:80]}...')
    
    except requests.RequestException as e:
        print(f'Error fetching interests: {str(e)}')
    except ET.ParseError as e:
        print(f'Error parsing XML: {str(e)}')
    except Exception as e:
        print(f'Unexpected error: {str(e)}')


def fetch_all_mp_interests():
    """Fetch interests for all active MPs"""
    print('Fetching interests for all active MPs...')
    
    mps = MP.objects.filter(active=True)
    total_mps = mps.count()
    
    print(f'Found {total_mps} active MPs')
    
    for idx, mp in enumerate(mps, 1):
        print(f'\n[{idx}/{total_mps}] Processing MP: {mp.full_name}')
        fetch_mp_interests(mp.althingi_id)
    
    print(f'\n=== All Done ===')
    print(f'Processed interests for {total_mps} MPs')


if __name__ == '__main__':
    # Check if a specific MP ID is provided
    if len(sys.argv) > 1:
        mp_id = int(sys.argv[1])
        fetch_mp_interests(mp_id)
    else:
        fetch_all_mp_interests()


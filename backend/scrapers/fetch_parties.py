"""
Fetch political parties from Alþingi API
Simple script to fetch and save political party data
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys
import html

# Setup Django - add parent directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')

# Import Django and setup
import django
django.setup()

from parliament.models import PoliticalParty


def fetch_parties(session_number=156):
    """Fetch political parties from Alþingi XML API"""
    print(f'Fetching political parties for session {session_number}...')
    
    url = f'https://www.althingi.is/altext/xml/thingflokkar/?lthing={session_number}'
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f'Error fetching parties: HTTP {response.status_code}')
            return
        
        root = ET.fromstring(response.content)
        
        parties_created = 0
        parties_updated = 0
        
        # Process each party
        for party in root.findall('þingflokkur'):
            try:
                # Get party details
                party_id = party.get('id')
                name_elem = party.find('heiti')
                name = html.unescape(name_elem.text.strip()) if name_elem is not None and name_elem.text else ''
                
                abbr_elem = party.find('.//stuttskammstöfun')
                short_abbr = html.unescape(abbr_elem.text.strip()) if abbr_elem is not None and abbr_elem.text else ''
                
                # Skip empty or placeholder parties
                if not name or name == ' ' or short_abbr == '-':
                    continue
                
                # Create description
                description = f"Active political party in session {session_number}"
                
                # Official colors from each party's website
                color_map = {
                    '35': '#4dabe9',  # Sjálfstæðisflokkur - Blue
                    '2': '#19412c',   # Framsóknarflokkur - Green
                    '38': '#da3520',  # Samfylkingin - Red
                    '45': '#ee8532',  # Viðreisn - Orange
                    '47': '#171f6a',  # Miðflokkurinn - Navy
                    '46': '#f7cc5b',  # Flokkur fólksins - Yellow
                }
                color = color_map.get(party_id, '#777777')  # Default to gray
                
                # Create or update the party
                party_obj, created = PoliticalParty.objects.update_or_create(
                    althingi_id=party_id,
                    defaults={
                        'name': name,
                        'abbreviation': short_abbr,
                        'description': description,
                        'color': color
                    }
                )
                
                if created:
                    parties_created += 1
                    print(f'✓ Created party: {name} ({short_abbr})')
                else:
                    parties_updated += 1
                    print(f'✓ Updated party: {name} ({short_abbr})')
                    
            except Exception as e:
                print(f'✗ Error processing party {party_id}: {str(e)}')
                continue
        
        print(f'\n=== Summary ===')
        print(f'Parties created: {parties_created}')
        print(f'Parties updated: {parties_updated}')
        print(f'Total: {parties_created + parties_updated}')
        
    except requests.RequestException as e:
        print(f'Error fetching parties: {str(e)}')
    except ET.ParseError as e:
        print(f'Error parsing XML: {str(e)}')
    except Exception as e:
        print(f'Unexpected error: {str(e)}')


if __name__ == '__main__':
    # Get session number from command line or use default
    session = int(sys.argv[1]) if len(sys.argv) > 1 else 156
    fetch_parties(session)


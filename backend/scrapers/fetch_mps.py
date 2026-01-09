"""
Fetch MPs (Members of Parliament) from Alþingi API
Simple script to fetch and save MP data
"""

import requests
import xml.etree.ElementTree as ET
import re
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

from parliament.models import MP, PoliticalParty, ParliamentSession, Speech
from parliament.utils import get_or_create_session


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


def fetch_mps(session_number):
    """Fetch MPs from Alþingi XML API"""
    print(f'Fetching MPs for session {session_number}...')
    
    # Get or create session (will update active status automatically)
    session = get_or_create_session(session_number, update_active_status=True)
    
    url = f'https://www.althingi.is/altext/xml/thingmenn/?lthing={session_number}'
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f'Error fetching MPs: HTTP {response.status_code}')
            return
        
        root = ET.fromstring(response.content)
        
        # Get all MPs currently linked to this session
        current_session_mps = set(session.members.values_list('althingi_id', flat=True))
        
        # Track which MPs are in the API response for this session
        mps_in_api_response = set()
        
        mps_created = 0
        mps_updated = 0
        
        for mp_element in root.findall(".//þingmaður"):
            try:
                althingi_id = int(mp_element.get("id"))
                name = mp_element.find("nafn").text.strip()
                
                # Track that this MP is in the API response
                mps_in_api_response.add(althingi_id)
                
                # Generate image URL
                image_url = f'https://www.althingi.is/myndir/mynd/thingmenn/{althingi_id}/org/mynd.jpg'
                
                # Fetch detailed MP info
                mp_detail_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/?nr={althingi_id}'
                mp_detail_response = requests.get(mp_detail_url)
                
                birth_date = None
                email = None
                website = ''
                bio = ''
                facebook_url = ''
                twitter_url = ''
                
                if mp_detail_response.status_code == 200:
                    detail_root = ET.fromstring(mp_detail_response.content)
                    
                    # Get birth date
                    birth_date_elem = detail_root.find('.//fæðingardagur')
                    if birth_date_elem is not None and birth_date_elem.text:
                        birth_date = parse_date(birth_date_elem.text)
                    
                    # Get email from text content
                    text_content = ' '.join(detail_root.itertext())
                    text_content = html.unescape(text_content)
                    email_pattern = r'([\w\.]+)\s+althingi\.is'
                    email_match = re.search(email_pattern, text_content)
                    if email_match:
                        email = f"{email_match.group(1)}@althingi.is"
                    
                    # Get website
                    website_elem = detail_root.find('.//vefsíða')
                    if website_elem is not None and website_elem.text:
                        website = website_elem.text.strip()
                    
                    # Get social media URLs
                    facebook_pattern = r'https?://(?:www\.)?facebook\.com/[^"\s]+'
                    twitter_pattern = r'https?://(?:www\.)?twitter\.com/[^"\s]+'
                    
                    facebook_match = re.search(facebook_pattern, text_content)
                    if facebook_match:
                        facebook_url = facebook_match.group(0)
                    
                    twitter_match = re.search(twitter_pattern, text_content)
                    if twitter_match:
                        twitter_url = twitter_match.group(0)
                    
                    # Fetch biography
                    lifshlaup_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/lifshlaup/?nr={althingi_id}'
                    try:
                        lifshlaup_response = requests.get(lifshlaup_url)
                        if lifshlaup_response.status_code == 200:
                            lifshlaup_root = ET.fromstring(lifshlaup_response.content)
                            bio_text = ' '.join(lifshlaup_root.itertext()).strip()
                            # Decode HTML entities like &ndash; &mdash; &amp; etc.
                            bio_text = html.unescape(bio_text)
                            # Clean up URLs and whitespace
                            bio_text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', bio_text)
                            bio_text = re.sub(r'\s+', ' ', bio_text)
                            bio = bio_text.strip()
                    except Exception as e:
                        print(f'  Warning: Error fetching biography for MP {althingi_id}: {str(e)}')
                
                # Split name into first and last name
                name_parts = name.split()
                first_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else name
                last_name = name_parts[-1] if len(name_parts) > 1 else ""
                
                # Fetch MP's party and constituency info
                mp_thingseta_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/thingseta/?nr={althingi_id}'
                mp_thingseta_response = requests.get(mp_thingseta_url)
                
                party = None
                constituency = ''
                first_elected = None
                current_position_started = None
                
                if mp_thingseta_response.status_code == 200:
                    thingseta_root = ET.fromstring(mp_thingseta_response.content)
                    thingseta_entries = thingseta_root.findall('.//þingsetur/þingseta')
                    
                    if thingseta_entries:
                        # Get latest parliamentary seat
                        latest_thingseta = max(thingseta_entries, key=lambda x: int(x.find('þing').text))
                        
                        # Get party
                        party_elem = latest_thingseta.find('þingflokkur')
                        if party_elem is not None:
                            party_id = party_elem.get('id')
                            if party_id:
                                try:
                                    party = PoliticalParty.objects.get(althingi_id=party_id)
                                except PoliticalParty.DoesNotExist:
                                    print(f'  Warning: Party with ID {party_id} not found for MP {name}')
                        
                        # Get constituency
                        constituency_elem = latest_thingseta.find('kjördæmi')
                        if constituency_elem is not None:
                            constituency = ''.join(constituency_elem.itertext()).strip()
                            constituency = html.unescape(constituency)
                        
                        # Get first elected date
                        first_thingseta = min(thingseta_entries, key=lambda x: int(x.find('þing').text))
                        first_date_elem = first_thingseta.find('tímabil/inn')
                        if first_date_elem is not None and first_date_elem.text:
                            first_elected = parse_date(first_date_elem.text.split()[0])
                        
                        # Get current position start date
                        current_date_elem = latest_thingseta.find('tímabil/inn')
                        if current_date_elem is not None and current_date_elem.text:
                            current_position_started = parse_date(current_date_elem.text.split()[0])
                
                # Create unique slug
                base_slug = slugify(f"{first_name}-{last_name}")
                slug = base_slug
                counter = 1
                while MP.objects.filter(slug=slug).exclude(althingi_id=althingi_id).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Calculate speech count
                speech_count = Speech.objects.filter(mp_althingi_id=althingi_id).count()
                
                # Create or update the MP
                with transaction.atomic():
                    mp, created = MP.objects.update_or_create(
                        althingi_id=althingi_id,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'slug': slug,
                            'party': party,
                            'constituency': constituency,
                            'email': email,
                            'website': website,
                            'facebook_url': facebook_url,
                            'twitter_url': twitter_url,
                            'bio': bio,
                            'birthdate': birth_date,
                            'active': True,
                            'first_elected': first_elected,
                            'current_position_started': current_position_started,
                            'speech_count': speech_count,
                            'bills_sponsored': 0,
                            'bills_cosponsored': 0,
                            'image_url': image_url
                        }
                    )
                    
                    # Add this MP to the session
                    if session not in mp.sessions.all():
                        mp.sessions.add(session)
                    
                    if created:
                        mps_created += 1
                        print(f'✓ Created MP: {name} (added to session {session_number})')
                    else:
                        mps_updated += 1
                        print(f'✓ Updated MP: {name} (added to session {session_number})')
            
            except Exception as e:
                print(f'✗ Error processing MP {althingi_id}: {str(e)}')
                continue
        
        # Remove MPs from this session if they're no longer in the API response
        mps_to_remove = current_session_mps - mps_in_api_response
        if mps_to_remove:
            removed_count = 0
            for mp_id in mps_to_remove:
                try:
                    mp = MP.objects.get(althingi_id=mp_id)
                    mp.sessions.remove(session)
                    removed_count += 1
                    print(f'✓ Removed MP {mp.full_name} (ID: {mp_id}) from session {session_number} (not in API response)')
                except MP.DoesNotExist:
                    pass
            print(f'Removed {removed_count} MP(s) from session {session_number} (no longer in session)')
        
        print(f'\n=== Summary ===')
        print(f'MPs created: {mps_created}')
        print(f'MPs updated: {mps_updated}')
        print(f'MPs in session: {len(mps_in_api_response)}')
        print(f'Total processed: {mps_created + mps_updated}')
    
    except Exception as e:
        print(f'Error fetching MPs: {str(e)}')


if __name__ == '__main__':
    # Get session number from command line (required)
    if len(sys.argv) < 2:
        print('Error: Session number is required')
        print('Usage: python fetch_mps.py <session_number>')
        print('Example: python fetch_mps.py 157')
        sys.exit(1)
    
    session = int(sys.argv[1])
    fetch_mps(session)


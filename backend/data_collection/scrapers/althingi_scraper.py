"""
Scraper for the Icelandic Parliament (Alþingi) website.
"""

import requests
import logging
import re
from bs4 import BeautifulSoup
from datetime import datetime
from django.utils.text import slugify
from parliament.models import (
    PoliticalParty,
    MP,
    Bill,
    ParliamentSession,
    Vote,
    Topic,
    Amendment,
    Speech
)

logger = logging.getLogger(__name__)


class AlthingiScraper:
    """Scraper for the Icelandic Parliament website."""
    
    BASE_URL = "https://www.althingi.is"
    
    def __init__(self, config=None):
        """Initialize the scraper with optional configuration."""
        self.config = config or {}
        self.session = requests.Session()
        
        # Set up headers to mimic a browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,is;q=0.8',
        })
    
    def scrape_mps(self):
        """Scrape MP data from the parliament website."""
        result = {
            'processed': 0,
            'created': 0,
            'updated': 0,
            'failed': 0,
            'log': ''
        }
        
        try:
            # Get the current MPs page
            url = f"{self.BASE_URL}/thingmenn/althingismenn/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            mp_list = soup.select('.member-item')
            
            result['log'] += f"Found {len(mp_list)} MPs on the page.\n"
            
            for mp_item in mp_list:
                try:
                    # Extract basic info
                    name_elem = mp_item.select_one('.member-name')
                    if not name_elem:
                        continue
                    
                    full_name = name_elem.text.strip()
                    name_parts = full_name.split()
                    first_name = ' '.join(name_parts[:-1])
                    last_name = name_parts[-1] if name_parts else ''
                    
                    # Extract MP profile URL and ID
                    profile_url = name_elem.get('href', '')
                    althingi_id = self._extract_id_from_url(profile_url)
                    
                    if not althingi_id:
                        result['log'] += f"Could not extract ID for MP {full_name}.\n"
                        result['failed'] += 1
                        continue
                    
                    # Extract party
                    party_elem = mp_item.select_one('.member-party')
                    party_name = party_elem.text.strip() if party_elem else ''
                    
                    # Get or create party
                    party = None
                    if party_name:
                        party, party_created = PoliticalParty.objects.get_or_create(
                            name=party_name,
                            defaults={
                                'abbreviation': self._get_party_abbreviation(party_name)
                            }
                        )
                    
                    # Extract constituency
                    constituency_elem = mp_item.select_one('.member-constituency')
                    constituency = constituency_elem.text.strip() if constituency_elem else ''
                    
                    # Get or update MP
                    mp, created = MP.objects.update_or_create(
                        althingi_id=althingi_id,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'slug': slugify(f"{first_name}-{last_name}"),
                            'party': party,
                            'constituency': constituency,
                            'active': True
                        }
                    )
                    
                    if created:
                        result['created'] += 1
                        result['log'] += f"Created MP: {mp.full_name}\n"
                    else:
                        result['updated'] += 1
                        result['log'] += f"Updated MP: {mp.full_name}\n"
                    
                    # If configured to fetch detailed profiles, do that
                    if self.config.get('fetch_detailed_profiles', False):
                        self._scrape_mp_details(mp, profile_url)
                    
                    result['processed'] += 1
                    
                except Exception as e:
                    result['failed'] += 1
                    result['log'] += f"Error processing MP: {str(e)}\n"
                    logger.exception(f"Error processing MP: {str(e)}")
            
        except Exception as e:
            result['log'] += f"Error scraping MPs: {str(e)}\n"
            logger.exception(f"Error scraping MPs: {str(e)}")
        
        return result
    
    def scrape_bills(self, session_number=None):
        """Scrape bill data from the parliament website."""
        result = {
            'processed': 0,
            'created': 0,
            'updated': 0,
            'failed': 0,
            'log': ''
        }
        
        try:
            # Get the current session if not specified
            if not session_number:
                # Get the current session
                session = ParliamentSession.objects.filter(is_active=True).first()
                if not session:
                    result['log'] += "No active parliament session found.\n"
                    return result
                session_number = session.session_number
            else:
                # Get or create the specified session
                session, created = ParliamentSession.objects.get_or_create(
                    session_number=session_number,
                    defaults={
                        'start_date': datetime.now().date(),
                        'is_active': True
                    }
                )
            
            # Get the bills page for the session
            url = f"{self.BASE_URL}/thingstorf/thingmalalistar-eftir-thingum/ferill/{session_number}/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            bill_list = soup.select('.matter-list .matter')
            
            result['log'] += f"Found {len(bill_list)} bills for session {session_number}.\n"
            
            for bill_item in bill_list:
                try:
                    # Extract basic info
                    title_elem = bill_item.select_one('.matter-title')
                    if not title_elem:
                        continue
                    
                    title = title_elem.text.strip()
                    
                    # Extract bill URL and ID
                    bill_url = title_elem.get('href', '')
                    althingi_id = self._extract_id_from_url(bill_url)
                    
                    if not althingi_id:
                        result['log'] += f"Could not extract ID for bill {title}.\n"
                        result['failed'] += 1
                        continue
                    
                    # Extract status
                    status_elem = bill_item.select_one('.matter-status')
                    status_text = status_elem.text.strip() if status_elem else ''
                    status = self._map_bill_status(status_text)
                    
                    # Extract date
                    date_elem = bill_item.select_one('.matter-date')
                    date_text = date_elem.text.strip() if date_elem else ''
                    introduced_date = self._parse_date(date_text)
                    
                    if not introduced_date:
                        introduced_date = datetime.now().date()
                    
                    # Get or update bill
                    bill, created = Bill.objects.update_or_create(
                        althingi_id=althingi_id,
                        defaults={
                            'title': title,
                            'slug': slugify(title),
                            'status': status,
                            'introduced_date': introduced_date,
                            'session': session,
                            'url': f"{self.BASE_URL}{bill_url}" if bill_url.startswith('/') else bill_url,
                            'description': title  # Default description is the title
                        }
                    )
                    
                    if created:
                        result['created'] += 1
                        result['log'] += f"Created bill: {bill.title}\n"
                    else:
                        result['updated'] += 1
                        result['log'] += f"Updated bill: {bill.title}\n"
                    
                    # If configured to fetch detailed bill info, do that
                    if self.config.get('fetch_detailed_bills', False):
                        self._scrape_bill_details(bill, bill_url)
                    
                    result['processed'] += 1
                    
                except Exception as e:
                    result['failed'] += 1
                    result['log'] += f"Error processing bill: {str(e)}\n"
                    logger.exception(f"Error processing bill: {str(e)}")
            
        except Exception as e:
            result['log'] += f"Error scraping bills: {str(e)}\n"
            logger.exception(f"Error scraping bills: {str(e)}")
        
        return result
    
    def _scrape_mp_details(self, mp, profile_url):
        """Scrape detailed information for an MP."""
        try:
            full_url = f"{self.BASE_URL}{profile_url}" if profile_url.startswith('/') else profile_url
            response = self.session.get(full_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract email
            email_elem = soup.select_one('a[href^="mailto:"]')
            if email_elem:
                mp.email = email_elem['href'].replace('mailto:', '')
            
            # Extract bio
            bio_elem = soup.select_one('.member-bio')
            if bio_elem:
                mp.bio = bio_elem.text.strip()
            
            # Extract photo URL
            photo_elem = soup.select_one('.member-photo img')
            if photo_elem and photo_elem.get('src'):
                # We would download and save the image here
                # For now, just store the URL
                mp.photo_url = photo_elem['src']
            
            # Save the updated MP
            mp.save()
            
        except Exception as e:
            logger.exception(f"Error scraping MP details for {mp.full_name}: {str(e)}")
    
    def _scrape_bill_details(self, bill, bill_url):
        """Scrape detailed information for a bill."""
        try:
            full_url = f"{self.BASE_URL}{bill_url}" if bill_url.startswith('/') else bill_url
            response = self.session.get(full_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract description/summary
            summary_elem = soup.select_one('.matter-summary')
            if summary_elem:
                bill.description = summary_elem.text.strip()
            
            # Extract sponsors
            sponsor_elems = soup.select('.matter-sponsors .member-name')
            for sponsor_elem in sponsor_elems:
                sponsor_url = sponsor_elem.get('href', '')
                sponsor_id = self._extract_id_from_url(sponsor_url)
                
                if sponsor_id:
                    try:
                        sponsor = MP.objects.get(althingi_id=sponsor_id)
                        bill.sponsors.add(sponsor)
                        
                        # Update MP stats
                        sponsor.bills_sponsored += 1
                        sponsor.save()
                    except MP.DoesNotExist:
                        logger.warning(f"Sponsor MP with ID {sponsor_id} not found")
            
            # Extract topics/categories
            topic_elems = soup.select('.matter-categories .category')
            for topic_elem in topic_elems:
                topic_name = topic_elem.text.strip()
                if topic_name:
                    topic, created = Topic.objects.get_or_create(
                        name=topic_name,
                        defaults={'slug': slugify(topic_name)}
                    )
                    bill.topics.add(topic)
            
            # Save the updated bill
            bill.save()
            
        except Exception as e:
            logger.exception(f"Error scraping bill details for {bill.title}: {str(e)}")
    
    def _extract_id_from_url(self, url):
        """Extract ID from a URL using regex."""
        if not url:
            return None
        
        # Try to find a numeric ID in the URL
        match = re.search(r'/(\d+)/?$', url)
        if match:
            return int(match.group(1))
        
        return None
    
    def _get_party_abbreviation(self, party_name):
        """Get abbreviation for a party name."""
        # Map of known party names to abbreviations
        party_abbr_map = {
            'Sjálfstæðisflokkur': 'D',
            'Framsóknarflokkur': 'B',
            'Samfylkingin': 'S',
            'Vinstrihreyfingin - grænt framboð': 'V',
            'Píratar': 'P',
            'Viðreisn': 'C',
            'Miðflokkurinn': 'M',
            'Flokkur fólksins': 'F'
        }
        
        return party_abbr_map.get(party_name, party_name[:1])
    
    def _map_bill_status(self, status_text):
        """Map Icelandic status text to our status choices."""
        status_map = {
            'Lagt fram': 'introduced',
            'Vísað til nefndar': 'in_committee',
            'Í nefnd': 'in_committee',
            'Til umræðu': 'in_debate',
            'Samþykkt': 'passed',
            'Fellt': 'rejected',
            'Dregið til baka': 'withdrawn'
        }
        
        # Default to 'introduced' if status not recognized
        return status_map.get(status_text, 'introduced')
    
    def _parse_date(self, date_text):
        """Parse Icelandic date format."""
        try:
            # Example: "15. mars 2023"
            # Remove the dot after the day
            date_text = date_text.replace('.', '')
            
            # Map Icelandic month names to numbers
            month_map = {
                'janúar': 1, 'febrúar': 2, 'mars': 3, 'apríl': 4,
                'maí': 5, 'júní': 6, 'júlí': 7, 'ágúst': 8,
                'september': 9, 'október': 10, 'nóvember': 11, 'desember': 12
            }
            
            # Split the date text
            parts = date_text.split()
            if len(parts) != 3:
                return None
            
            day = int(parts[0])
            month = month_map.get(parts[1].lower())
            year = int(parts[2])
            
            if not month:
                return None
            
            return datetime(year, month, day).date()
            
        except (ValueError, IndexError):
            return None 
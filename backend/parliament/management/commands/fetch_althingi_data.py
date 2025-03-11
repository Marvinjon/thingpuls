import requests
import re
import xml.etree.ElementTree as ET
from django.utils.text import slugify
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.db import transaction
from parliament.models import (
    PoliticalParty, 
    MP, 
    ParliamentSession, 
    Topic, 
    Bill, 
    Vote, 
    Speech
)

class Command(BaseCommand):
    help = 'Fetches data from the Alþingi website'

    def add_arguments(self, parser):
        parser.add_argument(
            '--data-type',
            type=str,
            choices=['mps', 'bills', 'parties', 'all'],
            default='all',
            help='Type of data to fetch (mps, bills, parties, or all)'
        )
        parser.add_argument(
            '--session',
            type=int,
            help='Parliament session number to fetch data for (defaults to current session)'
        )

    def handle(self, *args, **options):
        data_type = options['data_type']
        session_number = options['session']
        
        self.stdout.write(self.style.SUCCESS('Starting to fetch data from Alþingi website...'))
        
        # Get current session if not specified
        if not session_number:
            session_number = 156  # Default to 153 if not specified
            self.stdout.write(f'Using session: {session_number}')
        
        # Create the session in our database
        self.create_session(session_number)
        
        # Create default topics first
        self.create_default_topics()
        
        # Fetch data based on type
        if data_type in ['parties', 'all']:
            self.fetch_parties(session_number)
        
        if data_type in ['mps', 'all']:
            self.fetch_mps(session_number)
        
        if data_type in ['bills', 'all']:
            self.fetch_bills(session_number)
        
        self.stdout.write(self.style.SUCCESS('Data fetching completed!'))
    
    def create_session(self, session_number):
        """Create or update a parliamentary session."""
        try:
            # Create a basic session
            session, created = ParliamentSession.objects.get_or_create(
                session_number=session_number,
                defaults={
                    'start_date': datetime.now().date(),
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created session {session_number}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Using existing session {session_number}'))
            
            return session
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating session: {str(e)}'))
            return None
    
    def create_default_topics(self):
        """Create default topics if they don't exist."""
        self.stdout.write('Creating default topics...')
        
        default_topics = [
            {
                'name': 'Heilbrigðismál',
                'description': 'Heilbrigðisþjónusta, læknisþjónusta og lýðheilsa',
                'keywords': ['heilbrigðis', 'sjúkra', 'heilsu', 'lækn', 'sjúkrahús', 'heilbrigðisþjónust',
                           'lyfja', 'meðferð', 'hjúkrun', 'bráðamóttök']
            },
            {
                'name': 'Menntamál',
                'description': 'Menntun, skólar og fræðsla',
                'keywords': ['mennta', 'skóla', 'kennslu', 'náms', 'háskóla', 'framhaldsskól',
                           'grunnskól', 'fræðslu', 'nemend', 'kennara']
            },
            {
                'name': 'Umhverfismál',
                'description': 'Umhverfismál, loftslagsmál og náttúruvernd',
                'keywords': ['umhverfis', 'loftslags', 'náttúru', 'mengunar', 'orkumál', 'sjálfbær',
                           'endurvinnslu', 'græn', 'vistkerfi', 'landgræðslu', 'skógrækt']
            },
            {
                'name': 'Efnahagsmál',
                'description': 'Efnahagsmál, fjármál og viðskipti',
                'keywords': ['fjármála', 'efnahags', 'skatta', 'viðskipta', 'banka', 'fjárlög',
                           'verðbréf', 'gjald', 'tekju', 'kostnað', 'greiðslu']
            },
            {
                'name': 'Dómsmál',
                'description': 'Dómsmál, lög og réttarkerfi',
                'keywords': ['dóm', 'rétt', 'laga', 'saka', 'réttindi', 'dómstól', 'löggjöf',
                           'refsing', 'fangelsi', 'lögregl']
            }
        ]
        
        for topic_data in default_topics:
            topic, created = Topic.objects.get_or_create(
                name=topic_data['name'],
                defaults={
                    'description': topic_data['description'],
                    'keywords': topic_data['keywords']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created topic: {topic.name}'))
            else:
                self.stdout.write(f'Topic already exists: {topic.name}')

    def assign_topics_to_bill(self, bill, title, description):
        """Assign topics to a bill based on its title and description."""
        topics = Topic.objects.all()
        
        for topic in topics:
            # Get keywords for the topic
            keywords = topic.keywords if hasattr(topic, 'keywords') else []
            
            # Check if any keyword matches the title or description
            if any(keyword.lower() in title.lower() or 
                  (description and keyword.lower() in description.lower()) 
                  for keyword in keywords):
                bill.topics.add(topic)
                self.stdout.write(f'Added topic {topic.name} to bill: {title}')

    def fetch_parties(self, session_number):
        """Fetch political parties from Alþingi."""
        self.stdout.write('Fetching political parties...')
        
        url = 'https://www.althingi.is/altext/xml/thingflokkar/'
        try:
            response = requests.get(url)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Error fetching parties: HTTP {response.status_code}'))
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
                    name = name_elem.text.strip() if name_elem is not None and name_elem.text else ''
                    
                    abbr_elem = party.find('.//stuttskammstöfun')
                    short_abbr = abbr_elem.text.strip() if abbr_elem is not None and abbr_elem.text else ''
                    
                    long_abbr_elem = party.find('.//löngskammstöfun')
                    long_abbr = long_abbr_elem.text.strip() if long_abbr_elem is not None and long_abbr_elem.text else ''
                    
                    # Skip empty or placeholder parties
                    if not name or name == ' ' or short_abbr == '-':
                        continue
                    
                    # Get time period
                    first_session = party.find('.//fyrstaþing')
                    last_session = party.find('.//síðastaþing')
                    
                    # Create description
                    active_status = "Active" if last_session is None else "Inactive"
                    time_period = f"First session: {first_session.text if first_session is not None and first_session.text else 'Unknown'}"
                    if last_session is not None and last_session.text:
                        time_period += f", Last session: {last_session.text}"
                    
                    description = f"{active_status} political party. {time_period}"
                    
                    # Assign a color based on the party's ID (for visualization)
                    color_map = {
                        '35': '#0000FF',  # Sjálfstæðisflokkur - Blue
                        '2': '#00FF00',   # Framsóknarflokkur - Green
                        '38': '#FF0000',  # Samfylkingin - Red
                        '23': '#006400',  # Vinstrihreyfingin - grænt framboð - Dark Green
                        '43': '#800080',  # Píratar - Purple
                        '45': '#FFA500',  # Viðreisn - Orange
                        '47': '#008080',  # Miðflokkurinn - Teal
                        '46': '#FF00FF',  # Flokkur fólksins - Magenta
                    }
                    color = color_map.get(party_id, '#777777')  # Default to gray if no specific color
                    
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
                        self.stdout.write(self.style.SUCCESS(f'Created party: {name} ({short_abbr})'))
                    else:
                        parties_updated += 1
                        self.stdout.write(f'Updated party: {name} ({short_abbr})')
                        
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing party {party_id}: {str(e)}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'Parties created: {parties_created}, updated: {parties_updated}'))
            
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching parties: {str(e)}'))
        except ET.ParseError as e:
            self.stdout.write(self.style.ERROR(f'Error parsing XML: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {str(e)}'))

    def fetch_mps(self, session_number):
        """Fetch MPs from Alþingi."""
        self.stdout.write('Fetching MPs...')

        # Ensure session exists
        try:
            session = ParliamentSession.objects.get(session_number=session_number)
        except ParliamentSession.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Session {session_number} does not exist. Creating it first.'))
            session = self.create_session(session_number)
            if not session:
                self.stdout.write(self.style.ERROR(f'Could not create session {session_number}. Skipping MP fetching.'))
                return

        # Fetch data from Alþingi
        url = f'https://www.althingi.is/altext/xml/thingmenn/?lthing={session_number}'
        
        try:
            response = requests.get(url)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Error fetching MPs: HTTP {response.status_code}'))
                return

            # Parse XML
            root = ET.fromstring(response.content)

            mps_created = 0
            mps_updated = 0

            for mp_element in root.findall(".//þingmaður"):
                try:
                    althingi_id = mp_element.get("id")  # Get MP ID
                    name = mp_element.find("nafn").text.strip()
                    abbreviation = mp_element.find("skammstöfun").text.strip()

                    # Fetch detailed MP info
                    mp_detail_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/?nr={althingi_id}'
                    mp_detail_response = requests.get(mp_detail_url)
                    
                    birth_date = None
                    email = None
                    gender = ''
                    website = ''
                    bio = ''
                    facebook_url = ''
                    twitter_url = ''
                    
                    if mp_detail_response.status_code == 200:
                        detail_root = ET.fromstring(mp_detail_response.content)
                        
                        # Get birth date
                        birth_date_elem = detail_root.find('.//fæðingardagur')
                        if birth_date_elem is not None and birth_date_elem.text:
                            birth_date = self.parse_date(birth_date_elem.text)
                        
                        # Get email (from text content)
                        text_content = ' '.join(detail_root.itertext())
                        # Look for pattern: something followed by althingi.is
                        email_pattern = r'([\w\.]+)\s+althingi\.is'
                        email_match = re.search(email_pattern, text_content)
                        if email_match:
                            email = f"{email_match.group(1)}@althingi.is"
                        
                        # Get website if available
                        website_elem = detail_root.find('.//vefsíða')
                        if website_elem is not None and website_elem.text:
                            website = website_elem.text.strip()
                        
                        # Get social media URLs from text content
                        facebook_pattern = r'https?://(?:www\.)?facebook\.com/[^"\s]+'
                        twitter_pattern = r'https?://(?:www\.)?twitter\.com/[^"\s]+'
                        
                        facebook_match = re.search(facebook_pattern, text_content)
                        if facebook_match:
                            facebook_url = facebook_match.group(0)
                        
                        twitter_match = re.search(twitter_pattern, text_content)
                        if twitter_match:
                            twitter_url = twitter_match.group(0)
                        
                        # Fetch biography from lifshlaup URL
                        lifshlaup_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/lifshlaup/?nr={althingi_id}'
                        try:
                            lifshlaup_response = requests.get(lifshlaup_url)
                            if lifshlaup_response.status_code == 200:
                                lifshlaup_root = ET.fromstring(lifshlaup_response.content)
                                # Get all text content from the XML
                                bio_text = ' '.join(lifshlaup_root.itertext()).strip()
                                # Remove URLs and clean up the text
                                bio_text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', bio_text)
                                bio_text = re.sub(r'\s+', ' ', bio_text)  # Replace multiple spaces with single space
                                bio_text = bio_text.replace('&ndash;', '–')  # Replace HTML entities
                                bio = bio_text.strip()
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f'Error fetching biography for MP {althingi_id}: {str(e)}'))

                    # Split name into first and last name
                    name_parts = name.split()
                    first_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else name
                    last_name = name_parts[-1] if len(name_parts) > 1 else ""

                    # Fetch MP's parliamentary seat information to get party and constituency
                    mp_thingseta_url = f'https://www.althingi.is/altext/xml/thingmenn/thingmadur/thingseta/?nr={althingi_id}'
                    mp_thingseta_response = requests.get(mp_thingseta_url)
                    
                    party = None
                    constituency = ''
                    first_elected = None
                    current_position_started = None
                    
                    if mp_thingseta_response.status_code == 200:
                        thingseta_root = ET.fromstring(mp_thingseta_response.content)
                        # Find the most recent þingseta (parliamentary seat) entry
                        thingseta_entries = thingseta_root.findall('.//þingsetur/þingseta')
                        if thingseta_entries:
                            # Sort by þing (parliament) number in descending order
                            latest_thingseta = max(thingseta_entries, key=lambda x: int(x.find('þing').text))
                            party_elem = latest_thingseta.find('þingflokkur')
                            if party_elem is not None:
                                party_id = party_elem.get('id')
                                if party_id:
                                    try:
                                        party = PoliticalParty.objects.get(althingi_id=party_id)
                                    except PoliticalParty.DoesNotExist:
                                        self.stdout.write(self.style.WARNING(f"Party with ID {party_id} not found for MP {name}"))
                            
                            # Get constituency
                            constituency_elem = latest_thingseta.find('kjördæmi')
                            if constituency_elem is not None:
                                constituency = ''.join(constituency_elem.itertext()).strip()
                            
                            # Get first elected date
                            if thingseta_entries:
                                first_thingseta = min(thingseta_entries, key=lambda x: int(x.find('þing').text))
                                first_date_elem = first_thingseta.find('tímabil/inn')
                                if first_date_elem is not None and first_date_elem.text:
                                    first_elected = self.parse_date(first_date_elem.text.split()[0])
                            
                            # Get current position start date
                            current_date_elem = latest_thingseta.find('tímabil/inn')
                            if current_date_elem is not None and current_date_elem.text:
                                current_position_started = self.parse_date(current_date_elem.text.split()[0])

                    # Ensure Unique Slugs
                    base_slug = slugify(name)
                    slug = base_slug
                    counter = 1
                    while MP.objects.filter(slug=slug).exists():
                        slug = f"{base_slug}-{counter}"
                        counter += 1

                    # Create or update the MP
                    with transaction.atomic():
                        mp, created = MP.objects.update_or_create(
                            althingi_id=int(althingi_id),
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
                                'speech_count': 0,  # These will be updated separately
                                'bills_sponsored': 0,
                                'bills_cosponsored': 0
                            }
                        )

                        if created:
                            mps_created += 1
                            self.stdout.write(self.style.SUCCESS(
                                f'Created MP: {name} ({email or "no email"}) '
                                f'Born: {birth_date or "unknown"}'
                            ))
                        else:
                            mps_updated += 1
                            self.stdout.write(
                                f'Updated MP: {name} ({email or "no email"}) '
                                f'Born: {birth_date or "unknown"}'
                            )

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing MP {althingi_id}: {str(e)}'))
                    continue

            self.stdout.write(self.style.SUCCESS(f'MPs created: {mps_created}, updated: {mps_updated}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching MPs: {str(e)}'))

    def fetch_bills(self, session_number):
        """Fetch bills from Alþingi."""
        self.stdout.write('Fetching bills...')
        
        # Get the session
        try:
            session = ParliamentSession.objects.get(session_number=session_number)
        except ParliamentSession.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Session {session_number} does not exist. Creating it first.'))
            session = self.create_session(session_number)
            if not session:
                self.stdout.write(self.style.ERROR(f'Could not create session {session_number}. Skipping bill fetching.'))
                return
        
        bills_created = 0
        bills_updated = 0
        
        # Iterate through possible bill numbers (1 to 150 to be safe)
        for bill_number in range(1, 150):
            try:
                # Fetch individual bill data
                url = f'https://www.althingi.is/altext/xml/thingmalalisti/thingmal/?lthing={session_number}&malnr={bill_number}'
                response = requests.get(url)
                
                if response.status_code != 200:
                    continue
                
                # Parse XML
                try:
                    root = ET.fromstring(response.content)
                    
                    # Find the main bill element
                    bill_element = root.find(".//mál")
                    if bill_element is None:
                        continue
                    
                    # Extract basic bill information
                    title = root.find(".//málsheiti")
                    bill_type = root.find(".//málstegund")
                    status = root.find(".//staðamáls")
                    
                    # Skip if no title
                    if title is None or not title.text:
                        self.stdout.write(self.style.WARNING(f'Skipping bill {bill_number}: No title found'))
                        continue
                        
                    title_text = title.text.strip()
                    bill_type_text = bill_type.text.strip() if bill_type is not None and bill_type.text else "Unknown"
                    status_text = status.text.strip() if status is not None and status.text else "Unknown"
                    
                    # Create a unique slug
                    base_slug = slugify(title_text)[:180]  # Leave room for uniqueness suffix
                    slug = base_slug
                    counter = 1
                    while Bill.objects.filter(session=session, slug=slug).exists():
                        slug = f"{base_slug}-{counter}"
                        counter += 1
                    
                    # Find document info
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
                    
                    # Create or update the bill
                    with transaction.atomic():
                        bill, created = Bill.objects.update_or_create(
                            althingi_id=bill_number,
                            session=session,
                            defaults={
                                'title': title_text,
                                'slug': slug,
                                'description': f"{bill_type_text} - {status_text}",
                                'status': self.map_bill_status(status_text),
                                'introduced_date': introduced_date or session.start_date,
                                'url': f'https://www.althingi.is/thingstorf/thingmalalistar-eftir-thingum/ferill/?ltg={session_number}&mnr={bill_number}'
                            }
                        )
                        
                        # Assign topics based on title and description
                        self.assign_topics_to_bill(bill, title_text, f"{bill_type_text} - {status_text}")
                        
                        if created:
                            bills_created += 1
                            self.stdout.write(self.style.SUCCESS(f'Created bill {bill_number}: {title_text}'))
                        else:
                            bills_updated += 1
                            self.stdout.write(self.style.SUCCESS(f'Updated bill {bill_number}: {title_text}'))
                
                except ET.ParseError as e:
                    self.stdout.write(self.style.WARNING(f'XML parsing error for bill {bill_number}: {str(e)}'))
                    continue
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing bill {bill_number}: {str(e)}'))
                continue
        
        self.stdout.write(self.style.SUCCESS(f'Bills created: {bills_created}, updated: {bills_updated}'))
    
    def map_bill_status(self, status_text):
        """Map Alþingi bill status to our model's status choices."""
        status_map = {
            'Bíður fyrri umræðu': 'introduced',
            'Vísað til nefndar': 'in_committee',
            'Í nefnd': 'in_committee',
            'Í umræðu': 'in_debate',
            'Samþykkt': 'passed',
            'Fellt': 'rejected',
            'Dregið til baka': 'withdrawn'
        }
        
        for key, value in status_map.items():
            if key in status_text:
                return value
        
        return 'introduced'  # Default status
    
    def parse_date(self, date_string):
        """Parse date string from Alþingi XML."""
        if not date_string:
            return None
        
        try:
            # Try different date formats
            formats = ['%d.%m.%Y', '%Y-%m-%d']
            for fmt in formats:
                try:
                    return datetime.strptime(date_string, fmt).date()
                except ValueError:
                    continue
            
            return None
        except Exception:
            return None
    
    def get_party_abbreviation(self, party_name):
        """Get abbreviation for a party based on its name."""
        abbreviations = {
            'Sjálfstæðisflokkur': 'D',
            'Framsóknarflokkur': 'B',
            'Samfylkingin': 'S',
            'Vinstrihreyfingin - grænt framboð': 'V',
            'Píratar': 'P',
            'Viðreisn': 'C',
            'Miðflokkurinn': 'M',
            'Flokkur fólksins': 'F'
        }
        
        return abbreviations.get(party_name, party_name[:1])
    
    def get_party_color(self, party_name):
        """Get color for a party based on its name."""
        colors = {
            'Sjálfstæðisflokkur': '#0000FF',  # Blue
            'Framsóknarflokkur': '#00FF00',  # Green
            'Samfylkingin': '#FF0000',  # Red
            'Vinstrihreyfingin - grænt framboð': '#006400',  # Dark Green
            'Píratar': '#800080',  # Purple
            'Viðreisn': '#FFA500',  # Orange
            'Miðflokkurinn': '#008080',  # Teal
            'Flokkur fólksins': '#FF00FF'  # Magenta
        }
        
        return colors.get(party_name, '#777777')  # Default gray 
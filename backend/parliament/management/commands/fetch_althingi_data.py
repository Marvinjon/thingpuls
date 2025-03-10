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
            session_number = 153  # Default to 153 if not specified
            self.stdout.write(f'Using session: {session_number}')
        
        # Create the session in our database
        self.create_session(session_number)
        
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
    
    def fetch_parties(self, session_number):
        """Fetch political parties from Alþingi."""
        self.stdout.write('Fetching political parties...')
        
        # Create default parties based on known Icelandic parties
        default_parties = [
            {
                'name': 'Sjálfstæðisflokkur',
                'abbreviation': 'D',
                'color': '#0000FF',  # Blue
            },
            {
                'name': 'Framsóknarflokkur',
                'abbreviation': 'B',
                'color': '#00FF00',  # Green
            },
            {
                'name': 'Samfylkingin',
                'abbreviation': 'S',
                'color': '#FF0000',  # Red
            },
            {
                'name': 'Vinstrihreyfingin - grænt framboð',
                'abbreviation': 'V',
                'color': '#006400',  # Dark Green
            },
            {
                'name': 'Píratar',
                'abbreviation': 'P',
                'color': '#800080',  # Purple
            },
            {
                'name': 'Viðreisn',
                'abbreviation': 'C',
                'color': '#FFA500',  # Orange
            },
            {
                'name': 'Miðflokkurinn',
                'abbreviation': 'M',
                'color': '#008080',  # Teal
            },
            {
                'name': 'Flokkur fólksins',
                'abbreviation': 'F',
                'color': '#FF00FF',  # Magenta
            },
            {
                'name': 'Unknown Party',
                'abbreviation': 'UP',
                'color': '#777777',  # Gray
            }
        ]
        
        parties_created = 0
        parties_updated = 0
        
        for party_data in default_parties:
            party, created = PoliticalParty.objects.get_or_create(
                name=party_data['name'],
                defaults={
                    'abbreviation': party_data['abbreviation'],
                    'description': f'Political party in Iceland: {party_data["name"]}',
                    'color': party_data['color']
                }
            )
            
            if created:
                parties_created += 1
            else:
                parties_updated += 1
        
        self.stdout.write(self.style.SUCCESS(f'Parties created: {parties_created}, updated: {parties_updated}'))
    

    def fetch_mps(self, session_number):
        """Fetch MPs from Alþingi (now with unique slug handling)."""
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

            # **Step 1: Print Raw XML Response Preview**
            self.stdout.write(self.style.WARNING(f"🔍 Raw Response Preview:\n{response.text[:500]}"))

            # **Step 2: Parse XML**
            root = ET.fromstring(response.content)

            mps_created = 0
            mps_updated = 0

            for mp_element in root.findall("þingmaður"):
                althingi_id = mp_element.get("id")  # Get MP ID
                name = mp_element.find("nafn").text.strip()
                birth_date = mp_element.find("fæðingardagur").text.strip()
                abbreviation = mp_element.find("skammstöfun").text.strip()

                # Split name into first and last name
                name_parts = name.split()
                first_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else name
                last_name = name_parts[-1] if len(name_parts) > 1 else ""

                # **Step 3: Ensure Unique Slugs**
                base_slug = slugify(name)
                slug = base_slug
                counter = 1
                while MP.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                # **Step 4: Print Extracted Data**
                self.stdout.write(self.style.SUCCESS(f"✔ Extracted MP: {first_name} {last_name}, Born: {birth_date}, ID: {althingi_id}, Abbreviation: {abbreviation}, Slug: {slug}"))

                # **Don't assign a default party, leave it blank (None)**
                party = None

                # Create or update the MP
                with transaction.atomic():
                    mp, created = MP.objects.update_or_create(
                        althingi_id=int(althingi_id),
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'slug': slug,  # ✅ Now unique
                            'party': party,  # Leave blank if no party info
                            'constituency': '',  # Can be updated later
                            'email': f"{slug}@althingi.is",  # Placeholder email
                            'active': True
                        }
                    )

                    if created:
                        mps_created += 1
                    else:
                        mps_updated += 1

            self.stdout.write(self.style.SUCCESS(f'🎉 MPs created: {mps_created}, updated: {mps_updated}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error fetching MPs: {str(e)}'))

    
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
        
        # Fetch bills from the Alþingi website
        url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session_number}'
        
        try:
            response = requests.get(url)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Error fetching bills: HTTP {response.status_code}'))
                return
            
            # Process the raw text response
            raw_text = response.text
            
            # Create some topics
            topics = []
            for topic_name in ['Healthcare', 'Education', 'Environment', 'Economy', 'Justice']:
                topic, _ = Topic.objects.get_or_create(
                    name=topic_name,
                    defaults={'slug': slugify(topic_name)}
                )
                topics.append(topic)
            
            # Parse bill data using regex
            # This is a simplified approach - the actual parsing would need to be more sophisticated
            bill_pattern = r'<mál málsnúmer="(\d+)"[^>]*>.*?<málsheiti>(.*?)</málsheiti>'
            bill_matches = re.findall(bill_pattern, raw_text, re.DOTALL)
            
            bills_created = 0
            bills_updated = 0
            
            for match in bill_matches:
                bill_id = match[0]
                title = match[1].strip()
                
                if not title:
                    continue
                
                # Create or update the bill
                with transaction.atomic():
                    bill, created = Bill.objects.update_or_create(
                        althingi_id=int(bill_id),
                        defaults={
                            'title': title,
                            'slug': slugify(title),
                            'description': title,  # Use title as description for now
                            'status': 'introduced',  # Default status
                            'introduced_date': session.start_date,
                            'session': session,
                            'url': f'https://www.althingi.is/thingstorf/thingmalalistar-eftir-thingum/ferill/?ltg={session_number}&mnr={bill_id}'
                        }
                    )
                    
                    # Add random topics
                    import random
                    num_topics = min(len(topics), random.randint(1, 2))
                    bill_topics = random.sample(topics, num_topics)
                    bill.topics.set(bill_topics)
                    
                    if created:
                        bills_created += 1
                    else:
                        bills_updated += 1
            
            self.stdout.write(self.style.SUCCESS(f'Bills created: {bills_created}, updated: {bills_updated}'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching bills: {str(e)}'))
    
    def map_bill_status(self, status_text):
        """Map Alþingi bill status to our model's status choices."""
        status_map = {
            'Lagt fram': 'introduced',
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
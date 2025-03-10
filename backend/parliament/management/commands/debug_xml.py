import requests
import xml.etree.ElementTree as ET
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Debug XML structure from Alþingi website'

    def add_arguments(self, parser):
        parser.add_argument(
            '--endpoint',
            type=str,
            choices=['mps', 'bills', 'parties'],
            default='mps',
            help='Endpoint to debug (mps, bills, or parties)'
        )
        parser.add_argument(
            '--session',
            type=int,
            default=153,
            help='Parliament session number'
        )

    def handle(self, *args, **options):
        endpoint = options['endpoint']
        session_number = options['session']
        
        self.stdout.write(f'Debugging {endpoint} XML structure for session {session_number}...')
        
        if endpoint == 'mps':
            url = f'https://www.althingi.is/altext/xml/thingmenn/?lthing={session_number}'
        elif endpoint == 'bills':
            url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session_number}'
        elif endpoint == 'parties':
            url = f'https://www.althingi.is/altext/xml/thingflokkar/?lthing={session_number}'
        
        self.stdout.write(f'Fetching from URL: {url}')
        
        try:
            response = requests.get(url)
            
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Error: HTTP {response.status_code}'))
                return
            
            # Print the raw XML
            self.stdout.write('Raw XML:')
            self.stdout.write('-' * 80)
            self.stdout.write(response.text[:1000])  # Print first 1000 chars
            self.stdout.write('-' * 80)
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            # Print structure
            self.stdout.write('XML Structure:')
            self.stdout.write('-' * 80)
            self.print_element_structure(root)
            
            # Print specific elements based on endpoint
            if endpoint == 'mps':
                self.debug_mps(root)
            elif endpoint == 'bills':
                self.debug_bills(root)
            elif endpoint == 'parties':
                self.debug_parties(root)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
    
    def print_element_structure(self, element, level=0):
        """Print the structure of an XML element."""
        indent = '  ' * level
        self.stdout.write(f'{indent}{element.tag}')
        
        # Print attributes
        for name, value in element.attrib.items():
            self.stdout.write(f'{indent}  @{name} = {value}')
        
        # Print text content if any
        if element.text and element.text.strip():
            text = element.text.strip()
            if len(text) > 50:
                text = text[:47] + '...'
            self.stdout.write(f'{indent}  text = {text}')
        
        # Print children (limited to first 3)
        children = list(element)
        if children:
            if len(children) > 3:
                self.stdout.write(f'{indent}  ({len(children)} children, showing first 3)')
                children = children[:3]
            for child in children:
                self.print_element_structure(child, level + 1)
    
    def debug_mps(self, root):
        """Debug MPs XML structure."""
        self.stdout.write('MPs:')
        self.stdout.write('-' * 80)
        
        # Find all MP elements
        mps = root.findall('.//þingmaður')
        self.stdout.write(f'Found {len(mps)} MPs')
        
        # Print details of first 3 MPs
        for i, mp in enumerate(mps[:3]):
            self.stdout.write(f'MP #{i+1}:')
            self.stdout.write(f'  ID: {mp.get("id")}')
            
            # Try different paths to find name
            name_paths = [
                'nafn',
                'nafn/fornafn',
                'nafn/eftirnafn',
                'nafn/fullt-nafn'
            ]
            
            for path in name_paths:
                elem = mp.find(path)
                if elem is not None:
                    self.stdout.write(f'  {path}: {elem.text if elem.text else ""}')
            
            # Try to find party
            party_elem = mp.find('þingflokkur')
            if party_elem is not None:
                self.stdout.write(f'  Party: {party_elem.text if party_elem.text else ""}')
            
            # Try to find constituency
            constituency_elem = mp.find('kjördæmi')
            if constituency_elem is not None:
                self.stdout.write(f'  Constituency: {constituency_elem.text if constituency_elem.text else ""}')
            
            self.stdout.write('')
    
    def debug_bills(self, root):
        """Debug bills XML structure."""
        self.stdout.write('Bills:')
        self.stdout.write('-' * 80)
        
        # Find all bill elements
        bills = root.findall('.//mál')
        self.stdout.write(f'Found {len(bills)} bills')
        
        # Print details of first 3 bills
        for i, bill in enumerate(bills[:3]):
            self.stdout.write(f'Bill #{i+1}:')
            self.stdout.write(f'  ID: {bill.get("málsnúmer")}')
            self.stdout.write(f'  Type: {bill.get("málstegund")}')
            
            # Try to find title
            title_elem = bill.find('málsheiti')
            if title_elem is not None:
                self.stdout.write(f'  Title: {title_elem.text if title_elem.text else ""}')
            
            # Try to find status
            status_elem = bill.find('staða')
            if status_elem is not None:
                self.stdout.write(f'  Status: {status_elem.text if status_elem.text else ""}')
            
            self.stdout.write('')
    
    def debug_parties(self, root):
        """Debug parties XML structure."""
        self.stdout.write('Parties:')
        self.stdout.write('-' * 80)
        
        # Find all party elements
        parties = root.findall('.//þingflokkur')
        self.stdout.write(f'Found {len(parties)} parties')
        
        # Print details of all parties
        for i, party in enumerate(parties):
            self.stdout.write(f'Party #{i+1}:')
            self.stdout.write(f'  Name: {party.get("heiti")}')
            self.stdout.write(f'  Abbreviation: {party.get("skammstafanir")}')
            self.stdout.write('') 
import requests
import xml.etree.ElementTree as ET

class FetchVotingRecordsCommand:
    def fetch_all_voting_records(self, session, force):
        """Fetch voting records for all bills in a session."""
        self.stdout.write(self.style.SUCCESS(f'Fetching list of bills for session {session.session_number}...'))
        
        # First, get the list of bills for this session
        url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session.session_number}'
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            bills = root.findall('.//mál')
            
            self.stdout.write(self.style.SUCCESS(f'Found {len(bills)} bills'))
            
            for bill in bills:
                bill_id_elem = bill.find('málsnúmer')
                if bill_id_elem is None:
                    continue
                    
                bill_id = bill_id_elem.text
                status_element = bill.find('staða')
                
                # Only process bills that have been passed or rejected
                if status_element is not None and status_element.text in ['Samþykkt sem ályktun Alþingis.', 'Fellt.']:
                    self.stdout.write(f'Processing bill {bill_id} with status: {status_element.text}')
                    self.fetch_bill_voting_records(session, bill_id, force)
                
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching bill list: {str(e)}')) 
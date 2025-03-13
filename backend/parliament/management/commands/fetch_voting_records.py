import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import time
from django.core.management.base import BaseCommand
from django.db import transaction
from parliament.models import (
    ParliamentSession,
    Bill,
    MP,
    Vote
)


class Command(BaseCommand):
    help = 'Fetches voting records from the Alþingi website'
    DEFAULT_SESSION = 156  # Define a class constant for the default session

    def add_arguments(self, parser):
        parser.add_argument(
            '--session',
            type=int,
            help=f'Parliament session number to fetch data for (defaults to {self.DEFAULT_SESSION})'
        )
        parser.add_argument(
            '--bill',
            type=int,
            help='Specific bill number to fetch voting records for'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if records already exist'
        )
        parser.add_argument(
            '--max-retries',
            type=int,
            default=3,
            help='Maximum number of retries for failed requests'
        )

    def handle(self, *args, **options):
        session_number = options['session'] or self.DEFAULT_SESSION  # Use the class constant
        bill_number = options['bill']
        force = options['force']
        
        self.max_retries = options.get('max_retries', 3)
        self.timeout = 10  # Set a 10 second timeout for requests
        
        self.stdout.write(self.style.SUCCESS(f'Fetching voting records for session {session_number}...'))
        
        try:
            session = ParliamentSession.objects.get(session_number=session_number)
        except ParliamentSession.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Session {session_number} does not exist in the database'))
            self.stdout.write(self.style.WARNING('Creating session...'))
            session = ParliamentSession.objects.create(
                session_number=session_number,
                start_date=datetime.now().date(),
                is_active=True
            )
        
        if bill_number:
            self.fetch_bill_voting_records(session, bill_number, force)
        else:
            self.fetch_all_voting_records(session, force)
    
    def fetch_all_voting_records(self, session, force):
        """Fetch voting records for all bills in a session."""
        self.stdout.write(self.style.SUCCESS(f'Fetching list of bills for session {session.session_number}...'))
        
        # First, get the list of bills for this session
        url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session.session_number}'
        
        try:
            response = self.make_request(url)
            if not response:
                self.stdout.write(self.style.ERROR(f'Failed to fetch bill list after retries'))
                return
                
            root = ET.fromstring(response.content)
            bills = root.findall('.//mál')
            
            self.stdout.write(self.style.SUCCESS(f'Found {len(bills)} bills'))
            
            bills_processed = 0
            for bill in bills:
                try:
                    # Get the bill number from the URL
                    html_elem = bill.find('html')
                    if html_elem is None or not html_elem.text:
                        continue
                        
                    # Extract bill number from URL
                    import re
                    url_match = re.search(r'mnr=(\d+)', html_elem.text)
                    if not url_match:
                        continue
                        
                    bill_id = url_match.group(1)
                    self.stdout.write(f'\nProcessing bill {bill_id}...')
                    
                    # Get the bill title for logging
                    title_elem = bill.find('málsheiti')
                    title = title_elem.text if title_elem is not None else "Unknown title"
                    self.stdout.write(f'Title: {title}')
                    
                    # Process the bill
                    try:
                        self.fetch_bill_voting_records(session, bill_id, force)
                        bills_processed += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error processing bill {bill_id}: {str(e)}'))
                        continue
                    
                    # Add a small delay between requests to avoid overwhelming the server
                    time.sleep(0.5)
                    
                    # Log progress every 10 bills
                    if bills_processed % 10 == 0:
                        self.stdout.write(self.style.SUCCESS(f'Processed {bills_processed} bills so far...'))
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing bill: {str(e)}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'Completed processing {bills_processed} bills'))
                
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching bill list: {str(e)}'))
        except ET.ParseError as e:
            self.stdout.write(self.style.ERROR(f'Error parsing XML: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {str(e)}'))
    
    def make_request(self, url, retries=0):
        """Make a request with timeout and retry logic"""
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            return response
        except (requests.RequestException, requests.Timeout) as e:
            if retries < self.max_retries:
                self.stdout.write(self.style.WARNING(f'Request failed: {str(e)}. Retrying ({retries+1}/{self.max_retries})...'))
                time.sleep(2)  # Wait before retrying
                return self.make_request(url, retries + 1)
            else:
                self.stdout.write(self.style.ERROR(f'Request failed after {self.max_retries} retries: {str(e)}'))
                return None
    
    def fetch_bill_voting_records(self, session, bill_number, force):
        """Fetch voting records for a specific bill."""
        self.stdout.write(f'Fetching voting records for bill {bill_number}...')
        
        try:
            # Get the bill details to find voting IDs and create/update the bill record
            bill_details_url = f'https://www.althingi.is/altext/xml/thingmalalisti/thingmal/?lthing={session.session_number}&malnr={bill_number}'
            
            bill_response = self.make_request(bill_details_url)
            if not bill_response:
                self.stdout.write(self.style.ERROR(f'Failed to fetch details for bill {bill_number}'))
                return
            
            root = ET.fromstring(bill_response.content)
            
            # Get or create the bill in our database
            bill_title_elem = root.find('.//málsheiti')
            if bill_title_elem is None:
                self.stdout.write(self.style.ERROR(f'Could not find title for bill {bill_number}'))
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
            
            if created:
                self.stdout.write(f'Created new bill: {bill_obj}')
            
            # Find all voting records for this bill
            voting_records = root.findall('.//atkvæðagreiðsla')
            if not voting_records:
                self.stdout.write(f'No voting records found for bill {bill_number}')
                return
            
            for voting_record in voting_records:
                voting_id = voting_record.get('atkvæðagreiðslunúmer')
                if not voting_id:
                    continue
                
                # Now fetch the actual voting details using the voting ID
                voting_details_url = f'https://www.althingi.is/altext/xml/atkvaedagreidslur/atkvaedagreidsla/?numer={voting_id}'
                self.stdout.write(f"Fetching voting details from: {voting_details_url}")
                
                voting_details_response = self.make_request(voting_details_url)
                if not voting_details_response:
                    self.stdout.write(self.style.ERROR(f'Failed to fetch voting details for ID {voting_id}'))
                    continue
                
                voting_root = ET.fromstring(voting_details_response.content)
                
                # Get voting date
                date_elem = voting_root.find('.//tími')
                if date_elem is None or not date_elem.text:
                    self.stdout.write(self.style.WARNING(f'Could not find date for voting session {voting_id}'))
                    continue
                    
                vote_date = datetime.strptime(date_elem.text.split('T')[0], '%Y-%m-%d').date()
                
                # Check if we already have this voting session and skip if not forced
                if not force and Vote.objects.filter(bill=bill_obj, vote_date=vote_date).exists():
                    self.stdout.write(f'Voting records for bill {bill_number} on {vote_date} already exist. Use --force to update.')
                    continue
                
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
                    # Delete existing votes for this bill and date if we're updating
                    Vote.objects.filter(bill=bill_obj, vote_date=vote_date).delete()
                    
                    # Find all MP votes
                    mp_votes = voting_root.findall('.//þingmaður')
                    self.stdout.write(f"Found {len(mp_votes)} MP votes")
                    
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
                                vote=vote_value,
                                vote_date=vote_date,
                                session=session
                            )
                            votes_created += 1
                            
                        except MP.DoesNotExist:
                            name_elem = mp_elem.find('nafn')
                            name = name_elem.text if name_elem is not None else "Unknown"
                            self.stdout.write(self.style.WARNING(f"MP with ID {mp_id} ({name}) not found in database"))
                    
                    self.stdout.write(self.style.SUCCESS(f"Created {votes_created} votes"))
                
                # Small delay between requests
                time.sleep(0.5)
            
        except ET.ParseError as e:
            self.stdout.write(self.style.ERROR(f'Error parsing XML: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {str(e)}'))
            raise
    
    def fetch_voting_details_direct(self, session, bill_number, voting_id):
        """Fetch voting details directly using a known voting ID."""
        # If session is None, use default
        if session is None:
            try:
                session = ParliamentSession.objects.get(session_number=self.DEFAULT_SESSION)
            except ParliamentSession.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Default session {self.DEFAULT_SESSION} does not exist'))
                self.stdout.write(self.style.WARNING('Creating default session...'))
                session = ParliamentSession.objects.create(
                    session_number=self.DEFAULT_SESSION,
                    start_date=datetime.now().date(),
                    is_active=True
                )
        
        self.stdout.write(f'Fetching voting details directly for voting ID {voting_id}...')
        
        url = f'https://www.althingi.is/altext/xml/atkvaedagreidslur/atkvaedagreidsla/?numer={voting_id}'
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # Save the XML to a file for inspection
            with open('voting_details.xml', 'w', encoding='utf-8') as f:
                f.write(response.text)
            self.stdout.write("Saved XML to voting_details.xml for inspection")
            
            root = ET.fromstring(response.content)
            
            # Get or create the bill
            bill_title_elem = root.find('.//málsheiti')
            if bill_title_elem is None:
                self.stdout.write(self.style.ERROR(f'Could not find title for bill {bill_number}'))
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
            
            if created:
                self.stdout.write(f'Created new bill: {bill_obj}')
            
            # Get voting date
            date_elem = root.find('.//tími')
            if date_elem is None:
                self.stdout.write(self.style.ERROR(f'Could not find date for voting session {voting_id}'))
                return
                
            date_str = date_elem.text
            vote_date = datetime.strptime(date_str.split('T')[0], '%Y-%m-%d').date()
            self.stdout.write(f'Vote date: {vote_date}')
            
            # Get result
            result_elem = root.find('.//niðurstaða/niðurstaða')
            if result_elem is None:
                self.stdout.write(self.style.WARNING(f'Could not find result for voting session {voting_id}'))
                result = 'unknown'
            else:
                result = result_elem.text
                self.stdout.write(f'Vote result: {result}')
            
            # Update bill status based on result
            if result == 'samþykkt':
                bill_obj.status = 'passed'
            elif result == 'fellt':
                bill_obj.status = 'rejected'
            bill_obj.save()
            
            # Process individual votes
            with transaction.atomic():
                # Delete existing votes for this bill if we're updating
                Vote.objects.filter(bill=bill_obj).delete()
                
                # Find all MP votes in the XML
                mp_votes = root.findall('.//þingmaður')
                self.stdout.write(f"Found {len(mp_votes)} MP votes in the XML")
                
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
                            vote=vote_value,
                            vote_date=vote_date,
                            session=session
                        )
                        votes_created += 1
                        
                    except MP.DoesNotExist:
                        name_elem = mp_elem.find('nafn')
                        name = name_elem.text if name_elem is not None else "Unknown"
                        self.stdout.write(self.style.WARNING(f"MP with ID {mp_id} ({name}) not found in database"))
                
                self.stdout.write(self.style.SUCCESS(f"Created {votes_created} votes out of {len(mp_votes)} possible votes"))
            
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Error fetching voting details: {str(e)}"))
    
    def parse_date(self, date_string):
        """Parse date string from Althingi XML."""
        if not date_string:
            return None
        
        try:
            return datetime.strptime(date_string, '%Y-%m-%d').date()
        except ValueError:
            try:
                return datetime.strptime(date_string, '%d.%m.%Y').date()
            except ValueError:
                return None 
"""
Assign topics to bills using official Alþingi topic categories
Fetches topics from the Alþingi XML API and assigns them to bills

Usage:
    # Assign topics for all bills
    python assign_topics.py
    
    # Assign topics for a specific session (e.g., session 157)
    python assign_topics.py --session 157
    python assign_topics.py -s 157
    
    # Clear existing assignments before assigning
    python assign_topics.py --clear
    python assign_topics.py -c
    
    # Combine flags
    python assign_topics.py --session 157 --clear
"""

import os
import sys
import django
import requests
import xml.etree.ElementTree as ET
from time import sleep

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import Bill, Topic


def fetch_all_topics():
    """Fetch all topic categories from Alþingi XML API"""
    print('Fetching topics from Alþingi API...')
    
    url = 'https://www.althingi.is/altext/xml/efnisflokkar/'
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        topics = []
        
        # Parse the XML structure
        for yfirflokkur in root.findall('yfirflokkur'):
            yfirflokkur_id = yfirflokkur.get('id')
            yfirflokkur_heiti = yfirflokkur.find('heiti').text
            
            for efnisflokkur in yfirflokkur.findall('efnisflokkur'):
                efnisflokkur_id = efnisflokkur.get('id')
                heiti = efnisflokkur.find('heiti').text
                lysing_elem = efnisflokkur.find('lýsing')
                lysing = lysing_elem.text if lysing_elem is not None and lysing_elem.text else ''
                
                topics.append({
                    'id': efnisflokkur_id,
                    'name': heiti,
                    'description': lysing,
                    'parent_category': yfirflokkur_heiti,
                    'parent_id': yfirflokkur_id
                })
        
        print(f'  ✓ Found {len(topics)} topics')
        return topics
        
    except requests.RequestException as e:
        print(f'  ✗ Error fetching topics: {e}')
        return []


def fetch_bills_for_topic(topic_id, session=None):
    """Fetch all bills associated with a specific topic
    
    Args:
        topic_id: The topic ID to fetch bills for
        session: Optional parliament session number (e.g., 157). If None, fetches current session.
    
    Returns:
        List of tuples (bill_number, session_number)
    """
    url = f'https://www.althingi.is/altext/xml/efnisflokkar/efnisflokkur/?efnisflokkur={topic_id}'
    
    # Add session parameter if specified
    if session:
        url += f'&lthing={session}'
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        bills = []
        
        # Find the málalisti (bill list) element
        for yfirflokkur in root.findall('yfirflokkur'):
            for efnisflokkur in yfirflokkur.findall('efnisflokkur'):
                malalisti = efnisflokkur.find('málalisti')
                if malalisti is not None:
                    for mal in malalisti.findall('mál'):
                        malsnumer = mal.get('málsnúmer')
                        thingnumer = mal.get('þingnúmer')
                        
                        if malsnumer and thingnumer:
                            # Store as tuple (bill_number, session_number)
                            bills.append((int(malsnumer), int(thingnumer)))
        
        return bills
        
    except requests.RequestException as e:
        print(f'  ✗ Error fetching bills for topic {topic_id}: {e}')
        return []


def create_or_update_topics(topics_data):
    """Create or update topics in the database"""
    print('\nCreating/updating topics in database...')
    
    created_count = 0
    updated_count = 0
    
    for topic_data in topics_data:
        # Create a full description including parent category
        full_description = topic_data['description']
        if topic_data['parent_category']:
            full_description = f"{topic_data['parent_category']} - {full_description}" if full_description else topic_data['parent_category']
        
        topic, created = Topic.objects.update_or_create(
            name=topic_data['name'],
            defaults={
                'description': full_description,
                'keywords': []  # Not using keywords anymore
            }
        )
        
        if created:
            created_count += 1
            print(f'  ✓ Created: {topic.name}')
        else:
            updated_count += 1
            print(f'  ✓ Updated: {topic.name}')
    
    print(f'\n  Created: {created_count}, Updated: {updated_count}')


def assign_topics(clear_existing=False, session=None):
    """Assign topics to bills using official Alþingi categorization
    
    Args:
        clear_existing: If True, clears existing topic assignments before assigning
        session: Optional parliament session number (e.g., 157). If None, processes all bills.
    """
    if session:
        print(f'Starting topic assignment for session {session} from Alþingi API...\n')
    else:
        print('Starting topic assignment from Alþingi API...\n')
    
    # Fetch all topics from API
    topics_data = fetch_all_topics()
    if not topics_data:
        print('Error: Could not fetch topics from API')
        return
    
    # Create/update topics in database
    create_or_update_topics(topics_data)
    
    # Filter bills by session if specified
    if session:
        bills_queryset = Bill.objects.filter(session__session_number=session)
        session_bill_count = bills_queryset.count()
        if session_bill_count == 0:
            print(f'\n✗ No bills found for session {session} in database')
            return
        print(f'\n→ Filtering for session {session} ({session_bill_count} bills in database)')
    else:
        bills_queryset = Bill.objects.all()
    
    if clear_existing:
        print('\nClearing existing topic assignments...')
        for bill in bills_queryset:
            bill.topics.clear()
        print('✓ Cleared existing assignments')
    
    # Process each topic and assign bills
    print('\nAssigning topics to bills...\n')
    
    total_topics = len(topics_data)
    topics_processed = 0
    total_assignments = 0
    bills_with_topics = set()
    
    for topic_data in topics_data:
        topics_processed += 1
        topic_id = topic_data['id']
        topic_name = topic_data['name']
        
        print(f'[{topics_processed}/{total_topics}] Processing: {topic_name} (ID: {topic_id})')
        
        # Fetch bills for this topic (with optional session filter)
        bill_data = fetch_bills_for_topic(topic_id, session)
        
        if not bill_data:
            print(f'  → No bills found')
            sleep(0.5)  # Rate limiting
            continue
        
        print(f'  → Found {len(bill_data)} bills in API')
        
        # Get the topic object
        try:
            topic = Topic.objects.get(name=topic_name)
        except Topic.DoesNotExist:
            print(f'  ✗ Topic not found in database: {topic_name}')
            continue
        
        # Assign topic to bills
        assignments = 0
        not_found = 0
        
        for bill_number, session_number in bill_data:
            try:
                # Query by both althingi_id and session number
                bill = Bill.objects.get(
                    althingi_id=bill_number,
                    session__session_number=session_number
                )
                
                bill.topics.add(topic)
                assignments += 1
                bills_with_topics.add(f"{session_number}-{bill_number}")
            except Bill.DoesNotExist:
                not_found += 1
        
        total_assignments += assignments
        
        if assignments > 0:
            print(f'  ✓ Assigned to {assignments} bills', end='')
            if not_found > 0:
                print(f' ({not_found} bills not in database)')
            else:
                print()
        else:
            print(f'  → No matching bills in database')
        
        # Rate limiting
        sleep(0.5)
    
    # Summary
    total_bills = bills_queryset.count()
    bills_with_any_topic = len(bills_with_topics)
    
    print(f'\n=== Summary ===')
    if session:
        print(f'Session: {session}')
    print(f'Topics processed: {topics_processed}')
    print(f'Total topic assignments: {total_assignments}')
    print(f'Bills with at least one topic: {bills_with_any_topic}/{total_bills}')
    if total_assignments > 0 and bills_with_any_topic > 0:
        print(f'Average topics per bill (with topics): {total_assignments / bills_with_any_topic:.2f}')


if __name__ == '__main__':
    # Check if --clear flag is provided
    clear_existing = '--clear' in sys.argv or '-c' in sys.argv
    
    # Check for --session flag
    session = None
    for i, arg in enumerate(sys.argv):
        if arg in ['--session', '-s'] and i + 1 < len(sys.argv):
            try:
                session = int(sys.argv[i + 1])
            except ValueError:
                print(f'Error: Invalid session number: {sys.argv[i + 1]}')
                sys.exit(1)
            break
    
    # Print configuration
    if clear_existing:
        print('Will clear existing topic assignments\n')
    if session:
        print(f'Processing only session {session}\n')
    
    assign_topics(clear_existing, session)
    print('\n✓ Topic assignment completed!')


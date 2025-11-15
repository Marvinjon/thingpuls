"""
Assign topics to bills based on keywords
Simple script to assign relevant topics to bills
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import Bill, Topic


# Icelandic keywords for each topic
TOPIC_KEYWORDS = {
    'Heilbrigðismál': [
        'heilbrigðis', 'sjúkra', 'heilsu', 'lækn', 'sjúkrahús', 'heilbrigðisþjónust',
        'lyfja', 'meðferð', 'hjúkrun', 'bráðamóttök'
    ],
    'Menntamál': [
        'mennta', 'skóla', 'kennslu', 'náms', 'háskóla', 'framhaldsskól',
        'grunnskól', 'fræðslu', 'nemend', 'kennara'
    ],
    'Umhverfismál': [
        'umhverfis', 'loftslags', 'náttúru', 'mengunar', 'orkumál', 'sjálfbær',
        'endurvinnslu', 'græn', 'vistkerfi', 'landgræðslu', 'skógrækt'
    ],
    'Efnahagsmál': [
        'fjármála', 'efnahags', 'skatta', 'viðskipta', 'banka', 'fjárlög',
        'verðbréf', 'gjald', 'tekju', 'kostnað', 'greiðslu'
    ],
    'Dómsmál': [
        'dóm', 'rétt', 'laga', 'saka', 'réttindi', 'dómstól', 'löggjöf',
        'refsing', 'fangelsi', 'lögregl'
    ]
}


def create_default_topics():
    """Create default topics if they don't exist"""
    print('Creating/updating default topics...')
    
    default_topics = [
        {
            'name': 'Heilbrigðismál',
            'description': 'Heilbrigðisþjónusta, læknisþjónusta og lýðheilsa',
            'keywords': TOPIC_KEYWORDS['Heilbrigðismál']
        },
        {
            'name': 'Menntamál',
            'description': 'Menntun, skólar og fræðsla',
            'keywords': TOPIC_KEYWORDS['Menntamál']
        },
        {
            'name': 'Umhverfismál',
            'description': 'Umhverfismál, loftslagsmál og náttúruvernd',
            'keywords': TOPIC_KEYWORDS['Umhverfismál']
        },
        {
            'name': 'Efnahagsmál',
            'description': 'Efnahagsmál, fjármál og viðskipti',
            'keywords': TOPIC_KEYWORDS['Efnahagsmál']
        },
        {
            'name': 'Dómsmál',
            'description': 'Dómsmál, lög og réttarkerfi',
            'keywords': TOPIC_KEYWORDS['Dómsmál']
        }
    ]
    
    for topic_data in default_topics:
        topic, created = Topic.objects.update_or_create(
            name=topic_data['name'],
            defaults={
                'description': topic_data['description'],
                'keywords': topic_data['keywords']
            }
        )
        if created:
            print(f'  ✓ Created topic: {topic.name}')
        else:
            print(f'  ✓ Updated topic: {topic.name}')


def assign_topics_to_bill(bill, topics):
    """Assign topics to a bill based on keywords in title and description"""
    title_lower = bill.title.lower()
    desc_lower = bill.description.lower() if bill.description else ''
    
    topics_before = set(bill.topics.all())
    
    for topic in topics:
        keywords = topic.keywords if hasattr(topic, 'keywords') else []
        
        # Check if any keyword matches the title or description
        if any(keyword.lower() in title_lower or keyword.lower() in desc_lower for keyword in keywords):
            bill.topics.add(topic)
    
    topics_after = set(bill.topics.all())
    new_topics = topics_after - topics_before
    
    return len(new_topics)


def assign_topics(clear_existing=False):
    """Assign topics to all bills based on keywords"""
    print('Starting topic assignment...\n')
    
    # Create default topics first
    create_default_topics()
    print()
    
    # Get all topics
    topics = Topic.objects.all()
    if not topics:
        print('Error: No topics found in database')
        return
    
    # Get all bills
    bills = Bill.objects.all()
    total_bills = bills.count()
    
    if not bills:
        print('No bills found in database')
        return
    
    print(f'Found {total_bills} bills to process')
    print(f'Using {topics.count()} topics\n')
    
    if clear_existing:
        print('Clearing existing topic assignments...')
        for bill in bills:
            bill.topics.clear()
        print('✓ Cleared existing assignments\n')
    
    # Counter for processed bills
    bills_processed = 0
    topics_assigned = 0
    
    # Assign topics to each bill
    for bill in bills:
        new_topics = assign_topics_to_bill(bill, topics)
        topics_assigned += new_topics
        bills_processed += 1
        
        if new_topics > 0:
            topic_names = ', '.join([t.name for t in bill.topics.all()])
            print(f'✓ Bill {bill.althingi_id}: {bill.title[:60]}...')
            print(f'  Topics: {topic_names}')
        
        # Print progress every 50 bills
        if bills_processed % 50 == 0:
            print(f'\nProgress: {bills_processed}/{total_bills} bills processed...\n')
    
    print(f'\n=== Summary ===')
    print(f'Bills processed: {bills_processed}')
    print(f'New topic assignments: {topics_assigned}')
    print(f'Average topics per bill: {topics_assigned / bills_processed:.2f}')


if __name__ == '__main__':
    # Check if --clear flag is provided
    clear_existing = '--clear' in sys.argv or '-c' in sys.argv
    
    if clear_existing:
        print('Will clear existing topic assignments\n')
    
    assign_topics(clear_existing)
    print('\n✓ Topic assignment completed!')


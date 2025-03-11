import os
import sys
import django
from pathlib import Path

# Get the absolute path of the backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Add the backend directory to the Python path
sys.path.append(str(BACKEND_DIR))

# Setup Django's settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')
django.setup()

from parliament.models import Bill, Topic

def assign_topics():
    """Assign topics to bills based on keywords in their titles and descriptions."""
    print("Connecting to database...")
    
    try:
        # Get all topics
        topics = {
            'healthcare': Topic.objects.get(name='Healthcare'),
            'education': Topic.objects.get(name='Education'),
            'environment': Topic.objects.get(name='Environment'),
            'economy': Topic.objects.get(name='Economy'),
            'justice': Topic.objects.get(name='Justice')
        }
    except Topic.DoesNotExist as e:
        print(f"Error: Could not find all required topics. {str(e)}")
        return
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        return
    
    print("Successfully connected to database")
    
    # Get all bills
    try:
        bills = Bill.objects.all()
        print(f"Found {bills.count()} bills to process")
    except Exception as e:
        print(f"Error fetching bills: {str(e)}")
        return
    
    # Extended keywords for each topic
    topic_keywords = {
        'healthcare': [
            'heilbrigðis', 'sjúkra', 'heilsu', 'lækn', 'sjúkrahús', 'heilbrigðisþjónust',
            'lyfja', 'meðferð', 'hjúkrun', 'bráðamóttök'
        ],
        'education': [
            'mennta', 'skóla', 'kennslu', 'náms', 'háskóla', 'framhaldsskól',
            'grunnskól', 'fræðslu', 'nemend', 'kennara'
        ],
        'environment': [
            'umhverfis', 'loftslags', 'náttúru', 'mengunar', 'orkumál', 'sjálfbær',
            'endurvinnslu', 'græn', 'vistkerfi', 'landgræðslu', 'skógrækt'
        ],
        'economy': [
            'fjármála', 'efnahags', 'skatta', 'viðskipta', 'banka', 'fjárlög',
            'verðbréf', 'gjald', 'tekju', 'kostnað', 'greiðslu'
        ],
        'justice': [
            'dóm', 'rétt', 'laga', 'saka', 'réttindi', 'dómstól', 'löggjöf',
            'refsing', 'fangelsi', 'lögregl'
        ]
    }
    
    # Counter for processed bills
    bills_processed = 0
    topics_assigned = 0
    
    # Assign topics based on keywords in title and description
    for bill in bills:
        title_lower = bill.title.lower()
        desc_lower = bill.description.lower() if bill.description else ''
        
        topics_before = set(bill.topics.all())
        
        for topic_key, keywords in topic_keywords.items():
            if any(keyword in title_lower or keyword in desc_lower for keyword in keywords):
                bill.topics.add(topics[topic_key])
        
        topics_after = set(bill.topics.all())
        new_topics = len(topics_after - topics_before)
        topics_assigned += new_topics
        
        bills_processed += 1
        if bills_processed % 10 == 0:  # Print progress every 10 bills
            print(f"Processed {bills_processed}/{bills.count()} bills...")
        
        if new_topics > 0:
            print(f"Added {new_topics} topics to bill: {bill.title}")

    print(f"\nProcessing complete!")
    print(f"Total bills processed: {bills_processed}")
    print(f"Total new topic assignments: {topics_assigned}")

if __name__ == '__main__':
    print("Starting topic assignment...")
    assign_topics()
    print("Finished assigning topics to bills") 
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

def reassign_topics():
    """Reassign topics to bills based on keywords."""
    print("Starting topic reassignment...")
    
    # Get all topics
    topics = Topic.objects.all()
    bills = Bill.objects.all()
    
    print(f"Found {topics.count()} topics and {bills.count()} bills")
    
    for bill in bills:
        title_lower = bill.title.lower()
        desc_lower = bill.description.lower() if bill.description else ''
        
        # Clear existing topics
        bill.topics.clear()
        
        # Check each topic's keywords
        for topic in topics:
            keywords = topic.keywords
            if any(keyword.lower() in title_lower or keyword.lower() in desc_lower for keyword in keywords):
                bill.topics.add(topic)
                print(f"Added topic {topic.name} to bill: {bill.title}")

if __name__ == '__main__':
    reassign_topics()
    print("Topic reassignment completed!") 
import requests
import sys

def fetch_xml(endpoint, session=153):
    """Fetch XML from Alþingi website."""
    if endpoint == 'mps':
        url = f'https://www.althingi.is/altext/xml/thingmenn/?lthing={session}'
    elif endpoint == 'bills':
        url = f'https://www.althingi.is/altext/xml/thingmalalisti/?lthing={session}'
    elif endpoint == 'parties':
        url = f'https://www.althingi.is/altext/xml/thingflokkar/?lthing={session}'
    else:
        print(f"Unknown endpoint: {endpoint}")
        return
    
    print(f"Fetching from URL: {url}")
    
    try:
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"Error: HTTP {response.status_code}")
            return
        
        # Print the raw XML
        print("Raw XML:")
        print("-" * 80)
        print(response.text[:2000])  # Print first 2000 chars
        print("-" * 80)
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    endpoint = sys.argv[1] if len(sys.argv) > 1 else 'mps'
    session = int(sys.argv[2]) if len(sys.argv) > 2 else 153
    fetch_xml(endpoint, session) 
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from parliament.models import PoliticalParty, MP, ParliamentSession, Topic, Bill, Vote, Speech

class Command(BaseCommand):
    help = 'Seeds the database with sample data for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed database...'))
        
        # Create political parties
        self.create_parties()
        
        # Create parliament session
        self.create_sessions()
        
        # Create topics
        self.create_topics()
        
        # Create MPs
        self.create_mps()
        
        # Create bills
        self.create_bills()
        
        # Create votes
        self.create_votes()
        
        # Create speeches
        self.create_speeches()
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
    
    def create_parties(self):
        self.stdout.write('Creating political parties...')
        
        parties = [
            {
                'name': 'Independence Party',
                'abbreviation': 'IP',
                'description': 'Center-right political party in Iceland.',
                'color': '#0000FF',  # Blue
                'founding_date': date(1929, 5, 25),
            },
            {
                'name': 'Progressive Party',
                'abbreviation': 'PP',
                'description': 'Centrist agrarian party in Iceland.',
                'color': '#00FF00',  # Green
                'founding_date': date(1916, 12, 10),
            },
            {
                'name': 'Social Democratic Alliance',
                'abbreviation': 'SDA',
                'description': 'Social-democratic political party in Iceland.',
                'color': '#FF0000',  # Red
                'founding_date': date(2000, 5, 5),
            },
            {
                'name': 'Left-Green Movement',
                'abbreviation': 'LGM',
                'description': 'Left-wing green political party in Iceland.',
                'color': '#006400',  # Dark Green
                'founding_date': date(1999, 2, 6),
            },
            {
                'name': 'Reform Party',
                'abbreviation': 'RP',
                'description': 'Liberal political party in Iceland.',
                'color': '#FFA500',  # Orange
                'founding_date': date(2016, 5, 24),
            },
            {
                'name': 'Pirate Party',
                'abbreviation': 'PP',
                'description': 'Direct democratic political party in Iceland.',
                'color': '#800080',  # Purple
                'founding_date': date(2012, 11, 24),
            },
        ]
        
        for party_data in parties:
            party, created = PoliticalParty.objects.get_or_create(
                name=party_data['name'],
                defaults={
                    'abbreviation': party_data['abbreviation'],
                    'description': party_data['description'],
                    'color': party_data['color'],
                    'founding_date': party_data['founding_date'],
                }
            )
            
            if created:
                self.stdout.write(f'  Created party: {party.name}')
            else:
                self.stdout.write(f'  Party already exists: {party.name}')
    
    def create_sessions(self):
        self.stdout.write('Creating parliament sessions...')
        
        # Create current and previous sessions
        current_year = date.today().year
        
        for i in range(3):
            year = current_year - i
            start_date = date(year, 9, 1)  # Sessions typically start in September
            end_date = date(year + 1, 5, 31) if i > 0 else None  # Current session has no end date
            
            session, created = ParliamentSession.objects.get_or_create(
                session_number=153 - i,  # Just example numbers
                defaults={
                    'start_date': start_date,
                    'end_date': end_date,
                    'is_active': i == 0,  # Only the current session is active
                }
            )
            
            if created:
                self.stdout.write(f'  Created session: {session}')
            else:
                self.stdout.write(f'  Session already exists: {session}')
    
    def create_topics(self):
        self.stdout.write('Creating topics...')
        
        topics = [
            {'name': 'Healthcare', 'description': 'Issues related to healthcare and public health.'},
            {'name': 'Education', 'description': 'Issues related to education and schools.'},
            {'name': 'Environment', 'description': 'Environmental protection and climate change.'},
            {'name': 'Economy', 'description': 'Economic policy, taxation, and fiscal matters.'},
            {'name': 'Foreign Affairs', 'description': 'International relations and foreign policy.'},
            {'name': 'Justice', 'description': 'Legal system, courts, and law enforcement.'},
            {'name': 'Transportation', 'description': 'Infrastructure and transportation systems.'},
            {'name': 'Housing', 'description': 'Housing policy and urban development.'},
            {'name': 'Agriculture', 'description': 'Farming, fishing, and rural development.'},
            {'name': 'Energy', 'description': 'Energy policy and resources.'},
        ]
        
        for topic_data in topics:
            topic, created = Topic.objects.get_or_create(
                name=topic_data['name'],
                defaults={
                    'slug': slugify(topic_data['name']),
                    'description': topic_data['description'],
                }
            )
            
            if created:
                self.stdout.write(f'  Created topic: {topic.name}')
            else:
                self.stdout.write(f'  Topic already exists: {topic.name}')
    
    def create_mps(self):
        self.stdout.write('Creating MPs...')
        
        # Get all parties
        parties = list(PoliticalParty.objects.all())
        
        # Sample MP data
        mp_data = [
            {'first_name': 'Jón', 'last_name': 'Gunnarsson', 'gender': 'M', 'constituency': 'Reykjavík South'},
            {'first_name': 'Katrín', 'last_name': 'Jakobsdóttir', 'gender': 'F', 'constituency': 'Reykjavík North'},
            {'first_name': 'Bjarni', 'last_name': 'Benediktsson', 'gender': 'M', 'constituency': 'Southwest'},
            {'first_name': 'Þórdís', 'last_name': 'Kolbrún', 'gender': 'F', 'constituency': 'Northwest'},
            {'first_name': 'Guðlaugur', 'last_name': 'Þór', 'gender': 'M', 'constituency': 'Reykjavík North'},
            {'first_name': 'Lilja', 'last_name': 'Alfreðsdóttir', 'gender': 'F', 'constituency': 'Reykjavík South'},
            {'first_name': 'Sigurður', 'last_name': 'Ingi', 'gender': 'M', 'constituency': 'South'},
            {'first_name': 'Áslaug', 'last_name': 'Arna', 'gender': 'F', 'constituency': 'Southwest'},
            {'first_name': 'Guðmundur', 'last_name': 'Andri', 'gender': 'M', 'constituency': 'Northwest'},
            {'first_name': 'Halla', 'last_name': 'Signý', 'gender': 'F', 'constituency': 'Northeast'},
            {'first_name': 'Birgir', 'last_name': 'Ármannsson', 'gender': 'M', 'constituency': 'Reykjavík South'},
            {'first_name': 'Helga', 'last_name': 'Vala', 'gender': 'F', 'constituency': 'Reykjavík North'},
            {'first_name': 'Páll', 'last_name': 'Magnússon', 'gender': 'M', 'constituency': 'South'},
            {'first_name': 'Þórunn', 'last_name': 'Egilsdóttir', 'gender': 'F', 'constituency': 'Northeast'},
            {'first_name': 'Óli', 'last_name': 'Björn', 'gender': 'M', 'constituency': 'Southwest'},
            {'first_name': 'Silja', 'last_name': 'Dögg', 'gender': 'F', 'constituency': 'South'},
            {'first_name': 'Brynjar', 'last_name': 'Níelsson', 'gender': 'M', 'constituency': 'Reykjavík North'},
            {'first_name': 'Hanna', 'last_name': 'Katrín', 'gender': 'F', 'constituency': 'Reykjavík South'},
            {'first_name': 'Bergþór', 'last_name': 'Ólason', 'gender': 'M', 'constituency': 'Northwest'},
            {'first_name': 'Þórhildur', 'last_name': 'Sunna', 'gender': 'F', 'constituency': 'Southwest'},
        ]
        
        for i, data in enumerate(mp_data):
            # Generate a unique althingi_id
            althingi_id = i + 1000
            
            # Assign a random party
            party = random.choice(parties)
            
            # Generate random dates
            today = date.today()
            first_elected = today - timedelta(days=random.randint(365, 3650))
            current_position_started = first_elected + timedelta(days=random.randint(0, 365))
            
            # Create or update the MP
            mp, created = MP.objects.get_or_create(
                althingi_id=althingi_id,
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'slug': slugify(f"{data['first_name']}-{data['last_name']}"),
                    'party': party,
                    'constituency': data['constituency'],
                    'email': f"{slugify(data['first_name'])}.{slugify(data['last_name'])}@althingi.is",
                    'gender': data['gender'],
                    'active': True,
                    'first_elected': first_elected,
                    'current_position_started': current_position_started,
                    'bio': f"Biography of {data['first_name']} {data['last_name']}, representing {data['constituency']}.",
                    'social_media_links': {
                        'twitter': f"https://twitter.com/{slugify(data['first_name'])}{slugify(data['last_name'])}",
                        'facebook': f"https://facebook.com/{slugify(data['first_name'])}{slugify(data['last_name'])}",
                    }
                }
            )
            
            if created:
                self.stdout.write(f'  Created MP: {mp.full_name} ({mp.party.name})')
            else:
                self.stdout.write(f'  MP already exists: {mp.full_name}')
    
    def create_bills(self):
        self.stdout.write('Creating bills...')
        
        # Get all MPs, topics, and the current session
        mps = list(MP.objects.all())
        topics = list(Topic.objects.all())
        current_session = ParliamentSession.objects.filter(is_active=True).first()
        
        if not current_session:
            self.stdout.write(self.style.ERROR('No active parliament session found. Bills not created.'))
            return
        
        # Sample bill data
        bill_titles = [
            'Healthcare Reform Act',
            'Education Funding Bill',
            'Environmental Protection Act',
            'Tax Reform Bill',
            'Foreign Aid Appropriations',
            'Criminal Justice Reform',
            'Infrastructure Investment Act',
            'Affordable Housing Bill',
            'Agricultural Subsidies Reform',
            'Renewable Energy Act',
            'Data Privacy Protection Act',
            'Minimum Wage Increase Bill',
            'Public Transportation Funding',
            'Mental Health Services Act',
            'Small Business Support Bill',
            'Fishing Quota Regulation',
            'Gender Equality in the Workplace Act',
            'Digital Infrastructure Bill',
            'Pension System Reform',
            'Child Welfare Protection Act',
        ]
        
        # Status options with weights (introduced should be most common)
        status_options = [
            ('introduced', 0.3),
            ('in_committee', 0.2),
            ('in_debate', 0.2),
            ('amended', 0.1),
            ('passed', 0.1),
            ('rejected', 0.05),
            ('withdrawn', 0.05),
        ]
        
        for i, title in enumerate(bill_titles):
            # Generate a unique althingi_id
            althingi_id = i + 2000
            
            # Generate random dates within the current session
            days_since_session_start = (date.today() - current_session.start_date).days
            if days_since_session_start <= 0:
                days_since_session_start = 30  # Fallback if session start date is in the future
            
            introduced_date = current_session.start_date + timedelta(days=random.randint(1, days_since_session_start))
            
            # Select random status based on weights
            status = random.choices(
                [option[0] for option in status_options],
                weights=[option[1] for option in status_options],
                k=1
            )[0]
            
            # Create the bill
            bill, created = Bill.objects.get_or_create(
                althingi_id=althingi_id,
                defaults={
                    'title': title,
                    'slug': slugify(title),
                    'description': f"This bill aims to address issues related to {title.lower()}.",
                    'full_text': f"Full text of the {title}. This would contain all the legal language and provisions of the bill.",
                    'status': status,
                    'introduced_date': introduced_date,
                    'session': current_session,
                    'url': f"https://www.althingi.is/bills/{althingi_id}",
                }
            )
            
            if created:
                # Add sponsors (1-3 MPs)
                num_sponsors = random.randint(1, 3)
                sponsors = random.sample(mps, num_sponsors)
                bill.sponsors.set(sponsors)
                
                # Add topics (1-2 topics)
                num_topics = random.randint(1, 2)
                bill_topics = random.sample(topics, num_topics)
                bill.topics.set(bill_topics)
                
                # Add dates based on status
                if status in ['in_committee', 'in_debate', 'amended', 'passed', 'rejected']:
                    bill.committee_referral_date = introduced_date + timedelta(days=random.randint(7, 30))
                
                if status in ['in_debate', 'amended', 'passed', 'rejected']:
                    bill.debate_date = bill.committee_referral_date + timedelta(days=random.randint(7, 30))
                
                if status in ['passed', 'rejected']:
                    bill.vote_date = bill.debate_date + timedelta(days=random.randint(1, 14))
                
                bill.save()
                
                self.stdout.write(f'  Created bill: {bill.title} ({bill.status})')
            else:
                self.stdout.write(f'  Bill already exists: {bill.title}')
    
    def create_votes(self):
        self.stdout.write('Creating votes...')
        
        # Get all MPs and bills that have been voted on
        mps = list(MP.objects.all())
        bills = Bill.objects.filter(status__in=['passed', 'rejected'])
        
        if not bills.exists():
            self.stdout.write('  No bills with voting status found. Skipping vote creation.')
            return
        
        for bill in bills:
            # Get the session for this bill
            session = bill.session
            
            # For each MP, create a vote
            for mp in mps:
                # Determine vote based on party alignment and randomness
                # MPs from the same party as the bill sponsor are more likely to vote yes
                sponsor_parties = set(bill.sponsors.values_list('party_id', flat=True))
                
                if mp.party_id in sponsor_parties:
                    # 80% chance to vote with party
                    vote_choices = ['yes'] * 80 + ['no'] * 10 + ['abstain'] * 5 + ['absent'] * 5
                else:
                    # Opposition more likely to vote no
                    vote_choices = ['yes'] * 30 + ['no'] * 50 + ['abstain'] * 10 + ['absent'] * 10
                
                vote_value = random.choice(vote_choices)
                
                # Create the vote
                vote, created = Vote.objects.get_or_create(
                    bill=bill,
                    mp=mp,
                    defaults={
                        'vote': vote_value,
                        'vote_date': bill.vote_date,
                        'session': session,
                    }
                )
                
                if created:
                    self.stdout.write(f'  Created vote: {mp.full_name} voted {vote_value} on {bill.title}')
    
    def create_speeches(self):
        self.stdout.write('Creating speeches...')
        
        # Get all MPs and bills that are in debate or further along
        mps = list(MP.objects.all())
        bills = Bill.objects.filter(status__in=['in_debate', 'amended', 'passed', 'rejected'])
        
        if not bills.exists():
            self.stdout.write('  No bills in debate status found. Skipping speech creation.')
            return
        
        speech_titles = [
            "Opening Statement on",
            "Response to Concerns About",
            "Support for",
            "Opposition to",
            "Clarification on",
            "Amendment Proposal for",
            "Final Remarks on",
            "Committee Findings on",
            "Expert Testimony on",
            "Public Interest in",
        ]
        
        for bill in bills:
            # Get the session for this bill
            session = bill.session
            
            # Determine debate date
            debate_date = bill.debate_date or bill.introduced_date + timedelta(days=random.randint(14, 30))
            
            # Select 3-8 random MPs to give speeches
            num_speakers = random.randint(3, 8)
            speakers = random.sample(mps, num_speakers)
            
            for i, mp in enumerate(speakers):
                # Create a speech title
                title_prefix = random.choice(speech_titles)
                speech_title = f"{title_prefix} {bill.title}"
                
                # Create speech text
                speech_text = f"""
                Mr./Madam Speaker,
                
                I rise today to address the {bill.title}. This legislation is of great importance to our constituents and the future of our country.
                
                {'I support this bill and urge my colleagues to vote in favor of it.' if random.random() > 0.5 else 'I have serious concerns about this bill and urge careful consideration before proceeding.'}
                
                The impact on {random.choice(['healthcare', 'education', 'the economy', 'our environment', 'national security', 'local communities'])} cannot be overstated.
                
                {'We must act now to ensure a better future for all citizens.' if random.random() > 0.5 else 'We should take more time to study the implications of this legislation.'}
                
                Thank you.
                """
                
                # Create the speech
                speech, created = Speech.objects.get_or_create(
                    mp=mp,
                    bill=bill,
                    title=speech_title,
                    defaults={
                        'session': session,
                        'date': debate_date,
                        'text': speech_text.strip(),
                        'duration': random.randint(180, 900),  # 3-15 minutes in seconds
                    }
                )
                
                if created:
                    self.stdout.write(f'  Created speech: {mp.full_name} on {bill.title}')
                    
                    # Update MP speech count
                    mp.speech_count += 1
                    mp.save(update_fields=['speech_count']) 
"""
Management command to seed forum data.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from engagement.models import DiscussionForum, DiscussionThread, DiscussionPost

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample forum data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding forum data...')
        
        # Get or create a test user
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created test user: {user.email}'))
        else:
            self.stdout.write(f'Using existing user: {user.email}')
        
        # Create forums
        forums_data = [
            {
                'title': 'Legislative Discussions',
                'description': 'Discuss current and upcoming bills in parliament',
            },
            {
                'title': 'Political Accountability',
                'description': 'Discussions on MP accountability and transparency',
            },
            {
                'title': 'Electoral Reform',
                'description': 'Debate on voting systems and electoral reform',
            },
            {
                'title': 'Environmental Policy',
                'description': 'Discussions on climate policy and environmental protection',
            },
            {
                'title': 'Social Services',
                'description': 'Debates on healthcare, education and welfare policies',
            },
            {
                'title': 'Economic Affairs',
                'description': 'Discussions on economic policy, taxation and fiscal issues',
            },
        ]
        
        forums = []
        for forum_data in forums_data:
            forum, created = DiscussionForum.objects.get_or_create(
                title=forum_data['title'],
                defaults={
                    'description': forum_data['description'],
                    'is_active': True,
                }
            )
            forums.append(forum)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created forum: {forum.title}'))
            else:
                self.stdout.write(f'Forum already exists: {forum.title}')
        
        # Create some sample threads
        if forums:
            threads_data = [
                {
                    'forum': forums[3],  # Environmental Policy
                    'title': 'Impact of the new climate bill on rural communities',
                    'content': 'The new climate bill introduces several measures that could significantly impact rural communities in Iceland. While the goal of reducing carbon emissions is commendable, I\'m concerned about the potential economic burden on farmers and other rural businesses. What are your thoughts on how we can balance environmental goals with economic stability for rural areas?',
                },
                {
                    'forum': forums[4],  # Social Services
                    'title': 'Discussion: Proposed changes to healthcare funding',
                    'content': 'The recent proposals to change healthcare funding have sparked significant debate. What are the potential impacts on access to healthcare services, especially in rural areas?',
                },
                {
                    'forum': forums[1],  # Political Accountability
                    'title': 'Analysis of voting patterns in recent parliamentary sessions',
                    'content': 'I\'ve been analyzing voting patterns from the last few parliamentary sessions and noticed some interesting trends. Let\'s discuss what these patterns might reveal about party discipline and coalition politics.',
                },
                {
                    'forum': forums[2],  # Electoral Reform
                    'title': 'Opinion: The case for proportional representation',
                    'content': 'Iceland\'s current electoral system has its merits, but I believe we should seriously consider moving towards a more proportional representation system. Here\'s why...',
                },
                {
                    'forum': forums[5],  # Economic Affairs
                    'title': 'Discussion on the new tax proposal for small businesses',
                    'content': 'The new tax proposal for small businesses has both supporters and critics. Let\'s have a thoughtful discussion about its potential impacts on entrepreneurship and economic growth.',
                },
            ]
            
            for thread_data in threads_data:
                thread, created = DiscussionThread.objects.get_or_create(
                    forum=thread_data['forum'],
                    title=thread_data['title'],
                    defaults={
                        'created_by': user,
                    }
                )
                
                if created:
                    # Create the first post for the thread
                    DiscussionPost.objects.create(
                        thread=thread,
                        author=user,
                        content=thread_data['content'],
                        is_approved=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created thread: {thread.title}'))
                else:
                    self.stdout.write(f'Thread already exists: {thread.title}')
        
        self.stdout.write(self.style.SUCCESS('Forum data seeding completed!'))


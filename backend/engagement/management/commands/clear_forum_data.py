"""
Management command to clear forum test data.
"""

from django.core.management.base import BaseCommand
from engagement.models import DiscussionForum, DiscussionThread, DiscussionPost


class Command(BaseCommand):
    help = 'Clear all forum test data (threads and posts)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete forums too (not just threads and posts)',
        )

    def handle(self, *args, **options):
        self.stdout.write('Clearing forum data...')
        
        # Delete all posts
        post_count = DiscussionPost.objects.count()
        DiscussionPost.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {post_count} posts'))
        
        # Delete all threads
        thread_count = DiscussionThread.objects.count()
        DiscussionThread.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {thread_count} threads'))
        
        # Optionally delete forums
        if options['all']:
            forum_count = DiscussionForum.objects.count()
            DiscussionForum.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {forum_count} forums'))
        
        self.stdout.write(self.style.SUCCESS('Forum data cleared successfully!'))


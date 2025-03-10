"""
Signal handlers for the engagement app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DiscussionThread, DiscussionPost, Notification

# You can add actual signal handlers here as needed.
# For now, just creating this file will prevent import errors.

# Example signal handlers (commented out for now):
"""
@receiver(post_save, sender=DiscussionPost)
def post_created(sender, instance, created, **kwargs):
    '''Create notifications when a new post is created.'''
    if created and instance.thread:
        # Notify the thread creator if they're not the post author
        if instance.thread.created_by != instance.author:
            Notification.objects.create(
                user=instance.thread.created_by,
                type='discussion',
                title='New response in your thread',
                message=f'{instance.author.get_full_name()} responded to your thread "{instance.thread.title}"',
                related_object_type='DiscussionPost',
                related_object_id=instance.id
            )
""" 
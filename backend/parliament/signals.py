"""
Signal handlers for the parliament app.
"""

from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Bill, MP, Speech, Vote

# You can add actual signal handlers here as needed.
# For now, just creating this file will fix the import error.

# Example signal handlers (commented out for now):
"""
@receiver(post_save, sender=Bill)
def bill_saved(sender, instance, created, **kwargs):
    '''Update related statistics when a bill is saved.'''
    pass

@receiver(m2m_changed, sender=Bill.sponsors.through)
def bill_sponsors_changed(sender, instance, action, **kwargs):
    '''Update MP statistics when bill sponsorship changes.'''
    if action in ('post_add', 'post_remove', 'post_clear'):
        # Update statistics for each MP
        for mp in instance.sponsors.all():
            sponsored_count = mp.sponsored_bills.count()
            MP.objects.filter(id=mp.id).update(bills_sponsored=sponsored_count)
""" 
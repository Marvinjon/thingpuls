"""
Signal handlers for the users app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from .models import UserActivity

User = get_user_model()


@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    """Track user login activity."""
    if request:
        ip_address = get_client_ip(request)
        
        # Update user's last login IP
        user.last_login_ip = ip_address
        user.save(update_fields=['last_login_ip'])
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            ip_address=ip_address
        )


@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """Track user logout activity."""
    if request and user:
        ip_address = get_client_ip(request)
        UserActivity.objects.create(
            user=user,
            activity_type='logout',
            ip_address=ip_address
        )


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip 
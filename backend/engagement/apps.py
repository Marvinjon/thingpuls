"""
Engagement app configuration.
"""

from django.apps import AppConfig


class EngagementConfig(AppConfig):
    """Engagement app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'engagement'
    
    def ready(self):
        """Import signals when app is ready."""
        import engagement.signals  # noqa 
"""
Parliament app configuration.
"""

from django.apps import AppConfig


class ParliamentConfig(AppConfig):
    """Parliament app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'parliament'
    
    def ready(self):
        """Import signals when app is ready."""
        import parliament.signals  # noqa 
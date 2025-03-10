"""
UsersConfig module.
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Users app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    
    def ready(self):
        """Import signals when the app is ready."""
        import users.signals  # noqa 
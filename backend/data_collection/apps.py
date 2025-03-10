"""
Data collection app configuration.
"""

from django.apps import AppConfig


class DataCollectionConfig(AppConfig):
    """Data collection app configuration."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data_collection' 
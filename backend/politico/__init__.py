"""
Initialize Celery for the politico project.
"""

from .celery import app as celery_app

__all__ = ('celery_app',) 
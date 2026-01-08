"""
Celery configuration for politico project.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')

app = Celery('politico')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'fetch-althingi-data-daily': {
        'task': 'parliament.tasks.fetch_althingi_data',
        'schedule': crontab(minute=0, hour=5),  # Run daily at 05:00
    },
    'fetch-voting-records-daily': {
        'task': 'parliament.tasks.fetch_voting_records',
        'schedule': crontab(minute=15, hour=5),  # Run daily at 05:15 (after main fetch)
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 
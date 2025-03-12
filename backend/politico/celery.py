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
    'fetch-althingi-data-every-hour': {
        'task': 'parliament.tasks.fetch_althingi_data',
        'schedule': crontab(minute=0),  # Run every hour
    },
    'fetch-voting-records-every-hour': {
        'task': 'parliament.tasks.fetch_voting_records',
        'schedule': crontab(minute=30),  # Run every hour at 30 minutes past
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 
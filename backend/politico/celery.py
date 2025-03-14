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
    'fetch-althingi-data-workday': {
        'task': 'parliament.tasks.fetch_althingi_data',
        'schedule': crontab(minute=0, hour='8,11,14,17,20,23'),  # Run at 8, 11, 14, 17, 20, and 23
    },
    'fetch-voting-records-workday': {
        'task': 'parliament.tasks.fetch_voting_records',
        'schedule': crontab(minute=30, hour='8,11,14,17,20,23'),  # Run at 8:30, 11:30, 14:30, 17:30, 20:30, and 23:30
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 
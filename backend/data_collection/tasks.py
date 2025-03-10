"""
Celery tasks for data collection.
"""

import requests
import logging
import importlib
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from django.utils import timezone
from celery import shared_task
from .models import DataCollectionTask, DataCollectionRun

logger = logging.getLogger(__name__)


@shared_task
def run_data_collection_task(task_id):
    """Run a data collection task."""
    task = DataCollectionTask.objects.get(id=task_id)
    
    # Create a run record
    run = DataCollectionRun.objects.create(
        task=task,
        status='running',
        start_time=timezone.now()
    )
    
    try:
        # Update task status
        task.status = 'running'
        task.last_run = timezone.now()
        task.save()
        
        # Run the appropriate collector based on task type
        if task.task_type == 'mp_data':
            result = collect_mp_data(task, run)
        elif task.task_type == 'bill_data':
            result = collect_bill_data(task, run)
        elif task.task_type == 'vote_data':
            result = collect_vote_data(task, run)
        elif task.task_type == 'speech_data':
            result = collect_speech_data(task, run)
        elif task.task_type == 'party_data':
            result = collect_party_data(task, run)
        elif task.task_type == 'news_data':
            result = collect_news_data(task, run)
        else:
            raise ValueError(f"Unsupported task type: {task.task_type}")
        
        # Update run with results
        run.items_processed = result.get('processed', 0)
        run.items_created = result.get('created', 0)
        run.items_updated = result.get('updated', 0)
        run.items_failed = result.get('failed', 0)
        run.log = result.get('log', '')
        run.status = 'completed'
        run.end_time = timezone.now()
        run.save()
        
        # Update task status and next run time
        task.status = 'completed'
        if task.schedule_type != 'manual':
            task.next_run = calculate_next_run(task)
        task.save()
        
    except Exception as e:
        logger.exception(f"Error running task {task.name}: {str(e)}")
        
        # Update run with error
        run.status = 'failed'
        run.error_message = str(e)
        run.end_time = timezone.now()
        run.save()
        
        # Update task status
        task.status = 'failed'
        task.save()
        
        raise


@shared_task
def schedule_data_collection_tasks():
    """Schedule data collection tasks that are due to run."""
    now = timezone.now()
    
    # Find tasks that are scheduled and due to run
    tasks = DataCollectionTask.objects.filter(
        is_active=True,
        status__in=['pending', 'completed', 'failed'],
        schedule_type__in=['daily', 'weekly', 'monthly'],
        next_run__lte=now
    )
    
    for task in tasks:
        # Queue the task
        run_data_collection_task.delay(task.id)


def calculate_next_run(task):
    """Calculate the next run time for a scheduled task."""
    now = timezone.now()
    
    if task.schedule_type == 'daily':
        next_run = timezone.make_aware(datetime.combine(
            now.date() + timedelta(days=1),
            task.schedule_time or datetime.min.time()
        ))
    elif task.schedule_type == 'weekly':
        next_run = timezone.make_aware(datetime.combine(
            now.date() + timedelta(days=7),
            task.schedule_time or datetime.min.time()
        ))
    elif task.schedule_type == 'monthly':
        # Simple approximation - add 30 days
        next_run = timezone.make_aware(datetime.combine(
            now.date() + timedelta(days=30),
            task.schedule_time or datetime.min.time()
        ))
    else:
        next_run = None
    
    return next_run


# Data collection functions for different types of data
def collect_mp_data(task, run):
    """Collect MP data from the source."""
    source = task.source
    result = {
        'processed': 0,
        'created': 0,
        'updated': 0,
        'failed': 0,
        'log': ''
    }
    
    # Implementation would depend on the source type and configuration
    if source.source_type == 'api':
        # API-based collection
        pass
    elif source.source_type == 'website':
        # Web scraping-based collection
        if source.scraper_class:
            try:
                # Dynamically import and instantiate the scraper class
                module_path, class_name = source.scraper_class.rsplit('.', 1)
                module = importlib.import_module(module_path)
                scraper_class = getattr(module, class_name)
                scraper = scraper_class(source.scraper_config)
                
                # Run the scraper
                scraper_result = scraper.scrape_mps()
                result.update(scraper_result)
            except Exception as e:
                result['log'] += f"Error using scraper class: {str(e)}\n"
                result['failed'] += 1
        else:
            result['log'] += "No scraper class specified for website source.\n"
    
    return result


def collect_bill_data(task, run):
    """Collect bill data from the source."""
    # Similar implementation to collect_mp_data
    return {'processed': 0, 'created': 0, 'updated': 0, 'failed': 0, 'log': ''}


def collect_vote_data(task, run):
    """Collect vote data from the source."""
    # Similar implementation to collect_mp_data
    return {'processed': 0, 'created': 0, 'updated': 0, 'failed': 0, 'log': ''}


def collect_speech_data(task, run):
    """Collect speech data from the source."""
    # Similar implementation to collect_mp_data
    return {'processed': 0, 'created': 0, 'updated': 0, 'failed': 0, 'log': ''}


def collect_party_data(task, run):
    """Collect party data from the source."""
    # Similar implementation to collect_mp_data
    return {'processed': 0, 'created': 0, 'updated': 0, 'failed': 0, 'log': ''}


def collect_news_data(task, run):
    """Collect news data from the source."""
    # Similar implementation to collect_mp_data
    return {'processed': 0, 'created': 0, 'updated': 0, 'failed': 0, 'log': ''} 
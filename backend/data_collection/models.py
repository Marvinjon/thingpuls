"""
Models for data collection tasks and sources.
"""

from django.db import models
from django.utils import timezone


class DataSource(models.Model):
    """Model for data sources."""
    
    SOURCE_TYPES = [
        ('website', 'Website'),
        ('api', 'API'),
        ('rss', 'RSS Feed'),
        ('social_media', 'Social Media'),
    ]
    
    name = models.CharField(max_length=100)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    url = models.URLField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # For API sources
    api_key = models.CharField(max_length=255, blank=True)
    api_auth_method = models.CharField(max_length=50, blank=True)
    
    # For scraping configuration
    scraper_class = models.CharField(max_length=100, blank=True)
    scraper_config = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.source_type})"


class DataCollectionTask(models.Model):
    """Model for data collection tasks."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    TASK_TYPES = [
        ('mp_data', 'MP Data'),
        ('bill_data', 'Bill Data'),
        ('vote_data', 'Vote Data'),
        ('speech_data', 'Speech Data'),
        ('party_data', 'Party Data'),
        ('news_data', 'News Data'),
    ]
    
    name = models.CharField(max_length=100)
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='tasks')
    is_active = models.BooleanField(default=True)
    
    # Scheduling
    schedule_type = models.CharField(max_length=20, choices=[
        ('manual', 'Manual'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ], default='manual')
    schedule_time = models.TimeField(null=True, blank=True)
    
    # Task configuration
    parameters = models.JSONField(default=dict)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.task_type})"


class DataCollectionRun(models.Model):
    """Model for tracking individual data collection runs."""
    
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    task = models.ForeignKey(DataCollectionTask, on_delete=models.CASCADE, related_name='runs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='running')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Results
    items_processed = models.IntegerField(default=0)
    items_created = models.IntegerField(default=0)
    items_updated = models.IntegerField(default=0)
    items_failed = models.IntegerField(default=0)
    
    # Logs and errors
    log = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return f"Run of {self.task.name} at {self.start_time}" 
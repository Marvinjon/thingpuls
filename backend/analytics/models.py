"""
Models for analytics data.
"""

from django.db import models
from django.conf import settings


class DashboardConfiguration(models.Model):
    """Model for user dashboard configurations."""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboard_config')
    layout = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard config for {self.user.email}"


class SavedSearch(models.Model):
    """Model for saved searches."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=100)
    query_params = models.JSONField()
    search_type = models.CharField(max_length=50)  # e.g., 'bills', 'mps', 'speeches'
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'name')
    
    def __str__(self):
        return f"{self.name} ({self.search_type}) by {self.user.email}"


class AnalyticsReport(models.Model):
    """Model for analytics reports."""
    
    REPORT_TYPES = [
        ('voting_patterns', 'Voting Patterns'),
        ('mp_activity', 'MP Activity'),
        ('bill_progress', 'Bill Progress'),
        ('topic_trends', 'Topic Trends'),
        ('party_comparison', 'Party Comparison'),
        ('custom', 'Custom Report'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    parameters = models.JSONField(default=dict)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    
    # For storing generated report data
    data = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.report_type})"


class DataExport(models.Model):
    """Model for data exports."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('excel', 'Excel'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='data_exports')
    name = models.CharField(max_length=200)
    data_type = models.CharField(max_length=50)  # e.g., 'bills', 'votes', 'speeches'
    parameters = models.JSONField(default=dict)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='csv')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    file = models.FileField(upload_to='exports/', null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.data_type}) - {self.status}" 
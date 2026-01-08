"""
Models for user engagement features.
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify


class DiscussionForum(models.Model):
    """Model for discussion forums."""
    
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Optional relations to parliamentary entities
    related_bill = models.ForeignKey('parliament.Bill', on_delete=models.SET_NULL, 
                                    null=True, blank=True, related_name='discussion_forums')
    related_mp = models.ForeignKey('parliament.MP', on_delete=models.SET_NULL, 
                                  null=True, blank=True, related_name='discussion_forums')
    related_topic = models.ForeignKey('parliament.Topic', on_delete=models.SET_NULL, 
                                     null=True, blank=True, related_name='discussion_forums')
    
    # Moderation settings
    requires_approval = models.BooleanField(default=False)
    moderators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='moderated_forums', blank=True)
    
    class Meta:
        verbose_name_plural = 'Discussion forums'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class DiscussionThread(models.Model):
    """Model for discussion threads within forums."""
    
    forum = models.ForeignKey(DiscussionForum, on_delete=models.SET_NULL, null=True, blank=True, related_name='threads')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    topics = models.ManyToManyField('parliament.Topic', related_name='discussion_threads', blank=True)
    
    class Meta:
        ordering = ['-is_pinned', '-last_activity']
        unique_together = ('forum', 'slug')
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class DiscussionPost(models.Model):
    """Model for posts within discussion threads."""
    
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=True)
    
    # For tracking edits
    is_edited = models.BooleanField(default=False)
    edit_history = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Post by {self.author} in {self.thread.title}"


class Whistleblowing(models.Model):
    """Model for whistleblowing reports."""
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                    null=True, blank=True, related_name='whistleblowing_reports')
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    is_anonymous = models.BooleanField(default=False)
    
    # For categorization
    category = models.CharField(max_length=100, blank=True)
    
    # For tracking related entities
    related_mp = models.ForeignKey('parliament.MP', on_delete=models.SET_NULL, 
                                  null=True, blank=True, related_name='whistleblowing_reports')
    related_party = models.ForeignKey('parliament.PoliticalParty', on_delete=models.SET_NULL, 
                                     null=True, blank=True, related_name='whistleblowing_reports')
    
    # For evidence and attachments
    evidence = models.JSONField(null=True, blank=True)
    
    # For internal tracking
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                   null=True, blank=True, related_name='assigned_whistleblowing_reports')
    internal_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        if self.is_anonymous:
            return f"Anonymous report: {self.title}"
        return f"Report by {self.submitted_by}: {self.title}"


class Notification(models.Model):
    """Model for user notifications."""
    
    TYPE_CHOICES = [
        ('bill_update', 'Bill Update'),
        ('mp_update', 'MP Update'),
        ('vote', 'Vote'),
        ('discussion', 'Discussion'),
        ('whistleblowing', 'Whistleblowing'),
        ('system', 'System'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    # For linking to related content
    link = models.URLField(blank=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.user}: {self.title}" 
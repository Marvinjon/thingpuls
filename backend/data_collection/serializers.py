"""
Serializers for data collection models.
"""

from rest_framework import serializers
from .models import DataSource, DataCollectionTask, DataCollectionRun


class DataSourceSerializer(serializers.ModelSerializer):
    """Serializer for data sources."""
    
    class Meta:
        model = DataSource
        fields = ('id', 'name', 'source_type', 'url', 'description', 'is_active',
                  'api_auth_method', 'scraper_class', 'scraper_config',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'api_key': {'write_only': True}
        }


class DataCollectionTaskSerializer(serializers.ModelSerializer):
    """Serializer for data collection tasks."""
    
    source_name = serializers.CharField(source='source.name', read_only=True)
    
    class Meta:
        model = DataCollectionTask
        fields = ('id', 'name', 'task_type', 'source', 'source_name', 'is_active',
                  'schedule_type', 'schedule_time', 'parameters', 'status',
                  'last_run', 'next_run', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'last_run', 'next_run', 'created_at', 'updated_at')


class DataCollectionRunSerializer(serializers.ModelSerializer):
    """Serializer for data collection runs."""
    
    task_name = serializers.CharField(source='task.name', read_only=True)
    
    class Meta:
        model = DataCollectionRun
        fields = ('id', 'task', 'task_name', 'status', 'start_time', 'end_time',
                  'items_processed', 'items_created', 'items_updated', 'items_failed',
                  'log', 'error_message')
        read_only_fields = ('id', 'start_time', 'end_time', 'items_processed',
                           'items_created', 'items_updated', 'items_failed',
                           'log', 'error_message') 
"""
Serializers for analytics models.
"""

from rest_framework import serializers
from .models import (
    DashboardConfiguration,
    SavedSearch,
    AnalyticsReport,
    DataExport
)


class DashboardConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for dashboard configurations."""
    
    class Meta:
        model = DashboardConfiguration
        fields = ('id', 'user', 'layout', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class SavedSearchSerializer(serializers.ModelSerializer):
    """Serializer for saved searches."""
    
    class Meta:
        model = SavedSearch
        fields = ('id', 'user', 'name', 'query_params', 'search_type', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class AnalyticsReportSerializer(serializers.ModelSerializer):
    """Serializer for analytics reports."""
    
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalyticsReport
        fields = ('id', 'title', 'description', 'report_type', 'parameters',
                  'created_by', 'created_by_name', 'created_at', 'updated_at',
                  'is_public', 'data')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')
    
    def get_created_by_name(self, obj):
        """Return the name of the user who created the report."""
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.email
        return None


class DataExportSerializer(serializers.ModelSerializer):
    """Serializer for data exports."""
    
    class Meta:
        model = DataExport
        fields = ('id', 'user', 'name', 'data_type', 'parameters', 'format',
                  'status', 'created_at', 'completed_at', 'file', 'error_message')
        read_only_fields = ('id', 'user', 'status', 'created_at', 'completed_at',
                           'file', 'error_message') 
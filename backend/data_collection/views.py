"""
Views for data collection features.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import DataSource, DataCollectionTask, DataCollectionRun
from .serializers import (
    DataSourceSerializer,
    DataCollectionTaskSerializer,
    DataCollectionRunSerializer
)
from .tasks import run_data_collection_task


class DataSourceViewSet(viewsets.ModelViewSet):
    """ViewSet for data sources."""
    
    queryset = DataSource.objects.all()
    serializer_class = DataSourceSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'is_active']
    search_fields = ['name', 'description', 'url']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Return tasks for this data source."""
        source = self.get_object()
        tasks = source.tasks.all()
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = DataCollectionTaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DataCollectionTaskSerializer(tasks, many=True)
        return Response(serializer.data)


class DataCollectionTaskViewSet(viewsets.ModelViewSet):
    """ViewSet for data collection tasks."""
    
    queryset = DataCollectionTask.objects.all()
    serializer_class = DataCollectionTaskSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['task_type', 'source', 'is_active', 'status', 'schedule_type']
    search_fields = ['name']
    ordering_fields = ['name', 'last_run', 'next_run']
    
    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Run a data collection task."""
        task = self.get_object()
        
        if task.status == 'running':
            return Response(
                {"detail": "Task is already running."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update task status
        task.status = 'pending'
        task.save()
        
        # Queue the task
        run_data_collection_task.delay(task.id)
        
        return Response({"status": "Task queued for execution."})
    
    @action(detail=True, methods=['get'])
    def runs(self, request, pk=None):
        """Return runs for this task."""
        task = self.get_object()
        runs = task.runs.all()
        page = self.paginate_queryset(runs)
        if page is not None:
            serializer = DataCollectionRunSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DataCollectionRunSerializer(runs, many=True)
        return Response(serializer.data)


class DataCollectionRunViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for data collection runs."""
    
    queryset = DataCollectionRun.objects.all()
    serializer_class = DataCollectionRunSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task', 'status']
    ordering_fields = ['start_time', 'end_time'] 
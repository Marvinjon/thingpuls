"""
Celery tasks for analytics processing.
"""

import csv
import json
import pandas as pd
import os
import tempfile
from datetime import datetime
from django.core.files.base import ContentFile
from django.utils import timezone
from celery import shared_task
from .models import DataExport, AnalyticsReport
from parliament.models import Bill, Vote, MP, Speech


@shared_task
def generate_data_export(export_id):
    """Generate a data export file."""
    try:
        export = DataExport.objects.get(id=export_id)
        export.status = 'processing'
        export.save()
        
        # Get data based on export type
        data = get_export_data(export.data_type, export.parameters)
        
        # Generate file in the requested format
        file_content = generate_file(data, export.format)
        
        # Save the file to the export
        filename = f"{export.data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export.format}"
        export.file.save(filename, ContentFile(file_content))
        
        # Update export status
        export.status = 'completed'
        export.completed_at = timezone.now()
        export.save()
        
    except Exception as e:
        # Handle errors
        if export:
            export.status = 'failed'
            export.error_message = str(e)
            export.save()
        raise


@shared_task
def generate_analytics_report(report_id):
    """Generate data for an analytics report."""
    try:
        report = AnalyticsReport.objects.get(id=report_id)
        
        # Generate data based on report type
        if report.report_type == 'voting_patterns':
            data = generate_voting_patterns_report(report.parameters)
        elif report.report_type == 'mp_activity':
            data = generate_mp_activity_report(report.parameters)
        elif report.report_type == 'bill_progress':
            data = generate_bill_progress_report(report.parameters)
        elif report.report_type == 'topic_trends':
            data = generate_topic_trends_report(report.parameters)
        elif report.report_type == 'party_comparison':
            data = generate_party_comparison_report(report.parameters)
        else:
            data = {'error': 'Unsupported report type'}
        
        # Save the data to the report
        report.data = data
        report.updated_at = timezone.now()
        report.save()
        
    except Exception as e:
        # Handle errors
        if report:
            report.data = {'error': str(e)}
            report.save()
        raise


def get_export_data(data_type, parameters):
    """Get data for export based on type and parameters."""
    if data_type == 'bills':
        queryset = Bill.objects.all()
        
        # Apply filters from parameters
        if 'status' in parameters:
            queryset = queryset.filter(status=parameters['status'])
        if 'session_id' in parameters:
            queryset = queryset.filter(session_id=parameters['session_id'])
        if 'topic_id' in parameters:
            queryset = queryset.filter(topics__id=parameters['topic_id'])
        
        # Convert to list of dicts
        data = list(queryset.values(
            'id', 'title', 'status', 'introduced_date', 'committee_referral_date',
            'debate_date', 'vote_date', 'session__session_number'
        ))
        
    elif data_type == 'votes':
        queryset = Vote.objects.all()
        
        # Apply filters from parameters
        if 'bill_id' in parameters:
            queryset = queryset.filter(bill_id=parameters['bill_id'])
        if 'mp_id' in parameters:
            queryset = queryset.filter(mp_id=parameters['mp_id'])
        if 'party_id' in parameters:
            queryset = queryset.filter(mp__party_id=parameters['party_id'])
        
        # Convert to list of dicts
        data = list(queryset.values(
            'id', 'bill__title', 'mp__first_name', 'mp__last_name',
            'mp__party__name', 'vote', 'vote_date'
        ))
        
    elif data_type == 'speeches':
        queryset = Speech.objects.all()
        
        # Apply filters from parameters
        if 'bill_id' in parameters:
            queryset = queryset.filter(bill_id=parameters['bill_id'])
        if 'mp_id' in parameters:
            queryset = queryset.filter(mp_id=parameters['mp_id'])
        if 'session_id' in parameters:
            queryset = queryset.filter(session_id=parameters['session_id'])
        
        # Convert to list of dicts
        data = list(queryset.values(
            'id', 'mp__first_name', 'mp__last_name', 'bill__title',
            'date', 'title', 'duration', 'sentiment_score'
        ))
        
    else:
        data = []
    
    return data


def generate_file(data, format_type):
    """Generate a file in the requested format."""
    if format_type == 'csv':
        # Create a CSV file
        with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_file:
            if data:
                writer = csv.DictWriter(temp_file, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            
            temp_file_path = temp_file.name
        
        # Read the file content
        with open(temp_file_path, 'rb') as file:
            content = file.read()
        
        # Clean up
        os.unlink(temp_file_path)
        
        return content
        
    elif format_type == 'json':
        # Create a JSON file
        return json.dumps(data, default=str).encode('utf-8')
        
    elif format_type == 'excel':
        # Create an Excel file
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
            df = pd.DataFrame(data)
            df.to_excel(temp_file.name, index=False)
            temp_file_path = temp_file.name
        
        # Read the file content
        with open(temp_file_path, 'rb') as file:
            content = file.read()
        
        # Clean up
        os.unlink(temp_file_path)
        
        return content
    
    return b''


# Report generation functions
def generate_voting_patterns_report(parameters):
    """Generate voting patterns report data."""
    # Implementation would be similar to the voting_patterns action in the viewset
    return {}


def generate_mp_activity_report(parameters):
    """Generate MP activity report data."""
    # Implementation would be similar to the mp_activity action in the viewset
    return {}


def generate_bill_progress_report(parameters):
    """Generate bill progress report data."""
    return {}


def generate_topic_trends_report(parameters):
    """Generate topic trends report data."""
    # Implementation would be similar to the topic_trends action in the viewset
    return {}


def generate_party_comparison_report(parameters):
    """Generate party comparison report data."""
    return {} 
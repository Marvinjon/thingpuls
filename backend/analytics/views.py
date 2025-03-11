"""
Views for analytics features.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Avg, Q
from .models import (
    DashboardConfiguration,
    SavedSearch,
    AnalyticsReport,
    DataExport
)
from .serializers import (
    DashboardConfigurationSerializer,
    SavedSearchSerializer,
    AnalyticsReportSerializer,
    DataExportSerializer
)
from parliament.models import (
    Bill,
    Vote,
    MP,
    Speech,
    PoliticalParty,
    Topic
)
from .tasks import generate_data_export


class DashboardConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for dashboard configurations."""
    
    serializer_class = DashboardConfigurationSerializer
    permission_classes = []  # Allow public access
    
    def get_queryset(self):
        """Return all dashboard configurations."""
        return DashboardConfiguration.objects.all()
    
    def list(self, request):
        """Return dashboard data including parliamentary activity and analytics."""
        try:
            # Get parliamentary activity data
            total_bills = Bill.objects.count()
            passed_bills = Bill.objects.filter(status='passed').count()
            active_members = MP.objects.filter(active=True).count()
            total_parties = PoliticalParty.objects.count()
            total_votes = Vote.objects.count()

            # Get recent activity
            recent_bills = Bill.objects.order_by('-introduced_date')[:5]
            recent_votes = Vote.objects.order_by('-vote_date')[:5]

            # Combine and sort recent activity
            recent_activity = []
            
            for bill in recent_bills:
                recent_activity.append({
                    'title': bill.title,
                    'date': bill.introduced_date.isoformat() if bill.introduced_date else None,
                    'type': 'bill'
                })
            
            for vote in recent_votes:
                if vote.bill:  # Only add if there's an associated bill
                    recent_activity.append({
                        'title': f"Vote on {vote.bill.title}",
                        'date': vote.vote_date.isoformat() if vote.vote_date else None,
                        'type': 'vote'
                    })
            
            # Sort combined activity by date
            recent_activity = [a for a in recent_activity if a['date']]  # Filter out items with no date
            recent_activity.sort(key=lambda x: x['date'], reverse=True)
            recent_activity = recent_activity[:5]  # Keep only 5 most recent

            # Get voting patterns
            party_votes = Vote.objects.values(
                'mp__party__name', 
                'vote'
            ).filter(
                mp__party__isnull=False  # Only include votes where MP has a party
            ).annotate(
                count=Count('id')
            ).order_by('mp__party__name', 'vote')

            voting_patterns = {}
            for vote in party_votes:
                party = vote['mp__party__name']
                if party:  # Only process if party name exists
                    if party not in voting_patterns:
                        voting_patterns[party] = {'yes': 0, 'no': 0, 'abstain': 0, 'absent': 0}
                    vote_type = vote['vote']
                    if vote_type in voting_patterns[party]:
                        voting_patterns[party][vote_type] = vote['count']

            # Get MP activity
            top_mps = MP.objects.filter(active=True).annotate(
                vote_count=Count('voting_record'),
                sponsored_count=Count('bills_sponsored')  # Changed from bills to bills_sponsored
            ).order_by('-vote_count')[:10]

            mp_activity = {
                'labels': [f"{mp.first_name} {mp.last_name}" for mp in top_mps],
                'vote_counts': [mp.vote_count for mp in top_mps],
                'bill_counts': [mp.sponsored_count for mp in top_mps]
            }

            # Get topic trends
            top_topics = Topic.objects.annotate(
                bill_count=Count('bills')
            ).order_by('-bill_count')[:10]

            topic_trends = {
                'labels': [topic.name for topic in top_topics],
                'bill_counts': [topic.bill_count for topic in top_topics]
            }

            # Combine all data
            response_data = {
                'parliamentaryActivity': {
                    'totalBills': total_bills,
                    'passedBills': passed_bills,
                    'activeMembers': active_members,
                    'totalParties': total_parties,
                    'totalVotes': total_votes
                },
                'recentActivity': recent_activity,
                'votingPatterns': voting_patterns,
                'mpActivity': mp_activity,
                'topicTrends': topic_trends
            }

            return Response(response_data)

        except Exception as e:
            print(f"Error in dashboard data: {str(e)}")  # Add debug print
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SavedSearchViewSet(viewsets.ModelViewSet):
    """ViewSet for saved searches."""
    
    serializer_class = SavedSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['search_type']
    search_fields = ['name']
    
    def get_queryset(self):
        """Return saved searches for the current user."""
        return SavedSearch.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user field to the current user."""
        serializer.save(user=self.request.user)


class AnalyticsReportViewSet(viewsets.ModelViewSet):
    """ViewSet for analytics reports."""
    
    serializer_class = AnalyticsReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'is_public']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']
    
    def get_queryset(self):
        """Return reports based on user permissions."""
        user = self.request.user
        
        # Return public reports and user's own reports
        return AnalyticsReport.objects.filter(
            Q(is_public=True) | Q(created_by=user)
        )
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def voting_patterns(self, request):
        """Generate voting patterns report."""
        # Get parameters from request
        party_id = request.query_params.get('party_id')
        topic_id = request.query_params.get('topic_id')
        session_id = request.query_params.get('session_id')
        
        # Base query
        votes = Vote.objects.all()
        
        # Apply filters
        if party_id:
            votes = votes.filter(mp__party_id=party_id)
        if topic_id:
            votes = votes.filter(bill__topics__id=topic_id)
        if session_id:
            votes = votes.filter(session_id=session_id)
        
        # Aggregate data
        party_votes = votes.values('mp__party__name', 'vote').annotate(
            count=Count('id')
        ).order_by('mp__party__name', 'vote')
        
        # Format data for visualization
        result = {}
        for vote in party_votes:
            party = vote['mp__party__name']
            if party not in result:
                result[party] = {'yes': 0, 'no': 0, 'abstain': 0, 'absent': 0}
            result[party][vote['vote']] = vote['count']
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def mp_activity(self, request):
        """Generate MP activity report."""
        # Get parameters from request
        party_id = request.query_params.get('party_id')
        limit = int(request.query_params.get('limit', 10))
        
        # Base query
        mps = MP.objects.filter(active=True)
        
        # Apply filters
        if party_id:
            mps = mps.filter(party_id=party_id)
        
        # Annotate with activity metrics
        mps = mps.annotate(
            speech_count=Count('speeches'),
            sponsored_count=Count('sponsored_bills')
        ).order_by('-speech_count')[:limit]
        
        # Format data for visualization
        result = {
            'labels': [f"{mp.first_name} {mp.last_name}" for mp in mps],
            'speech_counts': [mp.speech_count for mp in mps],
            'bill_counts': [mp.sponsored_count for mp in mps]
        }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def topic_trends(self, request):
        """Generate topic trends report."""
        # Get top topics by bill count
        topics = Topic.objects.annotate(
            bill_count=Count('bills')
        ).order_by('-bill_count')[:10]
        
        # Format data for visualization
        result = {
            'labels': [topic.name for topic in topics],
            'bill_counts': [topic.bill_count for topic in topics]
        }
        
        return Response(result)


class DataExportViewSet(viewsets.ModelViewSet):
    """ViewSet for data exports."""
    
    serializer_class = DataExportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['data_type', 'status']
    ordering_fields = ['created_at', 'completed_at']
    
    def get_queryset(self):
        """Return exports for the current user."""
        return DataExport.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user field to the current user and queue export task."""
        export = serializer.save(user=self.request.user)
        
        # Queue the export task
        generate_data_export.delay(export.id)
        
        return export
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry a failed export."""
        export = self.get_object()
        
        if export.status != 'failed':
            return Response(
                {"detail": "Only failed exports can be retried."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status and clear error
        export.status = 'pending'
        export.error_message = ''
        export.save()
        
        # Queue the export task
        generate_data_export.delay(export.id)
        
        return Response({"status": "Export queued for retry."}) 
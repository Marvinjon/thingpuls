"""
Views for analytics features.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Avg, Q, Sum
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
            # Get session filter from query parameters
            session_id = request.query_params.get('session', None)
            
            # Base querysets
            bills_queryset = Bill.objects.all()
            votes_queryset = Vote.objects.all()
            speeches_queryset = Speech.objects.all()
            
            # Apply session filter if provided
            if session_id:
                bills_queryset = bills_queryset.filter(session_id=session_id)
                votes_queryset = votes_queryset.filter(session_id=session_id)
                speeches_queryset = speeches_queryset.filter(session_id=session_id)
            
            # Get parliamentary activity data
            total_bills = bills_queryset.count()
            passed_bills = bills_queryset.filter(status='passed').count()
            
            # Count active members - if session is filtered, count MPs in that session
            if session_id:
                # Count MPs who are in this session
                active_members = MP.objects.filter(sessions__id=session_id).distinct().count()
            else:
                # If no session filter, count all active MPs
                active_members = MP.objects.filter(active=True).count()
            
            total_parties = PoliticalParty.objects.count()
            total_votes = votes_queryset.count()
            
            # Calculate average bill processing time
            from django.db.models import F, ExpressionWrapper, fields
            from datetime import timedelta
            
            resolved_bills = bills_queryset.filter(
                vote_date__isnull=False,
                introduced_date__isnull=False
            ).exclude(status='introduced')
            
            if resolved_bills.count() > 0:
                total_days = 0
                count = 0
                for bill in resolved_bills:
                    days_diff = (bill.vote_date - bill.introduced_date).days
                    if days_diff >= 0:  # Only count positive values
                        total_days += days_diff
                        count += 1
                avg_processing_days = round(total_days / count) if count > 0 else 0
            else:
                avg_processing_days = 0

            # Get recent activity
            recent_bills = bills_queryset.order_by('-introduced_date')[:5]
            recent_votes = votes_queryset.order_by('-vote_date')[:5]

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
            party_votes = votes_queryset.values(
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

            # Get Bill Progress Pipeline - distribution of bills by status
            bill_statuses = bills_queryset.values('status').annotate(
                count=Count('id')
            ).order_by('status')
            
            bill_pipeline = {}
            for status_item in bill_statuses:
                bill_pipeline[status_item['status']] = status_item['count']

            # Get Party Cohesion Scores - voting unity per party
            party_cohesion = {}
            parties = PoliticalParty.objects.all()
            
            for party in parties:
                # Get all votes by this party's MPs
                party_votes = votes_queryset.filter(mp__party=party)
                
                if party_votes.count() > 0:
                    # Group votes by bill to calculate cohesion
                    bills_voted = party_votes.values('bill_id').distinct()
                    cohesion_scores = []
                    
                    for bill in bills_voted:
                        bill_id = bill['bill_id']
                        votes_on_bill = party_votes.filter(bill_id=bill_id)
                        total_votes = votes_on_bill.count()
                        
                        if total_votes > 1:  # Need at least 2 votes to measure cohesion
                            # Count the most common vote
                            vote_counts = votes_on_bill.values('vote').annotate(
                                count=Count('id')
                            ).order_by('-count')
                            
                            if vote_counts:
                                max_agreement = vote_counts[0]['count']
                                cohesion = (max_agreement / total_votes) * 100
                                cohesion_scores.append(cohesion)
                    
                    # Calculate average cohesion for the party
                    if cohesion_scores:
                        party_cohesion[party.name] = round(sum(cohesion_scores) / len(cohesion_scores), 1)
                    else:
                        party_cohesion[party.name] = 0
                else:
                    party_cohesion[party.name] = 0

            # Get Legislative Efficiency Timeline - bills passed over time
            from datetime import datetime, timedelta
            from django.db.models.functions import TruncMonth
            
            # Get bills passed in the last 12 months, grouped by month
            twelve_months_ago = timezone.now() - timedelta(days=365)
            efficiency_timeline = bills_queryset.filter(
                status='passed',
                introduced_date__gte=twelve_months_ago
            ).annotate(
                month=TruncMonth('introduced_date')
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')
            
            timeline_data = {
                'labels': [item['month'].strftime('%b %Y') if item['month'] else 'Unknown' for item in efficiency_timeline],
                'counts': [item['count'] for item in efficiency_timeline]
            }

            # Get topic trends (filtered by session if provided)
            if session_id:
                top_topics = Topic.objects.filter(
                    bills__session_id=session_id
                ).annotate(
                    bill_count=Count('bills', filter=Q(bills__session_id=session_id))
                ).order_by('-bill_count')[:10]
            else:
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
                    'totalVotes': total_votes,
                    'avgProcessingDays': avg_processing_days
                },
                'recentActivity': recent_activity,
                'votingPatterns': voting_patterns,
                'billPipeline': bill_pipeline,
                'partyCohesion': party_cohesion,
                'efficiencyTimeline': timeline_data,
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
    
    def get_permissions(self):
        """Allow public access to read-only analytics actions."""
        if self.action in ['voting_patterns', 'mp_activity', 'topic_trends', 'top_speakers']:
            return []
        return super().get_permissions()
    
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
    
    @action(detail=False, methods=['get'])
    def top_speakers(self, request):
        """Generate top speakers report - MPs who speak the most."""
        limit = int(request.query_params.get('limit', 10))
        session_id = request.query_params.get('session', None)
        
        # Base queryset for speeches
        speeches_queryset = Speech.objects.all()
        if session_id:
            speeches_queryset = speeches_queryset.filter(session_id=session_id)
        
        # Get top MPs by speaking time in the selected session
        top_mps_data = speeches_queryset.values(
            'mp_id', 'mp__first_name', 'mp__last_name', 'mp__slug',
            'mp__party__name', 'mp__party__abbreviation', 'mp__party__color',
            'mp__image_url'
        ).annotate(
            total_speaking_time=Sum('duration'),
            speech_count=Count('id')
        ).filter(
            total_speaking_time__gt=0
        ).order_by('-total_speaking_time')[:limit]
        
        # Format data for visualization
        result = []
        for mp_data in top_mps_data:
            total_time = mp_data['total_speaking_time'] or 0
            speaking_time_minutes = round(total_time / 60, 1)
            result.append({
                'id': mp_data['mp_id'],
                'name': f"{mp_data['mp__first_name']} {mp_data['mp__last_name']}",
                'slug': mp_data['mp__slug'],
                'party': mp_data['mp__party__name'] or 'Óháður',
                'party_abbreviation': mp_data['mp__party__abbreviation'] or 'Óh.',
                'party_color': mp_data['mp__party__color'] or '#808080',
                'total_speaking_time': total_time,
                'speaking_time_minutes': speaking_time_minutes,
                'speaking_time_hours': round(total_time / 3600, 1),
                'image_url': mp_data['mp__image_url'],
                'speech_count': mp_data['speech_count']
            })
        
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
"""
Views for the parliament app.
"""

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    PoliticalParty, 
    Topic, 
    ParliamentSession, 
    MP, 
    Bill, 
    Amendment, 
    Vote, 
    Speech,
    MPInterest
)
from .serializers import (
    PoliticalPartySerializer,
    TopicSerializer,
    ParliamentSessionSerializer,
    MPListSerializer,
    MPDetailSerializer,
    BillListSerializer,
    BillDetailSerializer,
    AmendmentSerializer,
    VoteSerializer,
    SpeechSerializer,
    MPInterestSerializer
)


class PoliticalPartyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing political parties."""
    
    queryset = PoliticalParty.objects.all()
    serializer_class = PoliticalPartySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'abbreviation']
    ordering_fields = ['name']


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing policy topics."""
    
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    
    @action(detail=True, methods=['get'])
    def bills(self, request, pk=None):
        """Return bills related to this topic."""
        topic = self.get_object()
        bills = topic.bills.all()
        page = self.paginate_queryset(bills)
        if page is not None:
            serializer = BillListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BillListSerializer(bills, many=True)
        return Response(serializer.data)


class ParliamentSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing parliamentary sessions."""
    
    queryset = ParliamentSession.objects.all()
    serializer_class = ParliamentSessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['session_number', 'start_date']
    
    @action(detail=True, methods=['get'])
    def bills(self, request, pk=None):
        """Return bills in this session."""
        session = self.get_object()
        bills = session.bills.all()
        page = self.paginate_queryset(bills)
        if page is not None:
            serializer = BillListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BillListSerializer(bills, many=True)
        return Response(serializer.data)


class MPViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing MPs."""
    
    queryset = MP.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['party', 'active', 'constituency', 'sessions']
    search_fields = ['first_name', 'last_name', 'bio']
    ordering_fields = ['last_name', 'first_name', 'bills_sponsored', 'speech_count']
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Filter queryset based on request parameters."""
        queryset = super().get_queryset()
        
        # Filter by session if provided
        session_id = self.request.query_params.get('session', None)
        if session_id:
            queryset = queryset.filter(sessions__id=session_id).distinct()
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return MPDetailSerializer
        return MPListSerializer
    
    @action(detail=True, methods=['get'])
    def speeches(self, request, slug=None):
        """Return speeches made by this MP."""
        mp = self.get_object()
        speeches = mp.speeches.all()
        
        # Filter by session if provided
        session_id = request.query_params.get('session', None)
        if session_id:
            speeches = speeches.filter(session_id=session_id)
        
        page = self.paginate_queryset(speeches)
        if page is not None:
            serializer = SpeechSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = SpeechSerializer(speeches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def bills(self, request, slug=None):
        """Return bills sponsored by this MP."""
        mp = self.get_object()
        bills = mp.sponsored_bills.all()
        
        # Filter by session if provided
        session_id = request.query_params.get('session', None)
        if session_id:
            bills = bills.filter(session_id=session_id)
        
        page = self.paginate_queryset(bills)
        if page is not None:
            serializer = BillListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BillListSerializer(bills, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def voting_record(self, request, slug=None):
        """Return voting record for this MP."""
        mp = self.get_object()
        votes = mp.voting_record.all()
        
        # Filter by session if provided
        session_id = request.query_params.get('session', None)
        if session_id:
            votes = votes.filter(session_id=session_id)
        
        page = self.paginate_queryset(votes)
        if page is not None:
            serializer = VoteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VoteSerializer(votes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def interests(self, request, slug=None):
        """Return interests for this MP."""
        mp = self.get_object()
        try:
            interest = MPInterest.objects.get(mp=mp)
            serializer = MPInterestSerializer(interest)
            return Response(serializer.data)
        except MPInterest.DoesNotExist:
            return Response({'detail': 'No interests found for this MP.'}, status=404)


class BillViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing bills."""
    
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'session', 'topics', 'bill_type', 'submitter_type']
    search_fields = ['title', 'description']
    ordering_fields = ['introduced_date', 'last_update', 'vote_date']
    
    def get_queryset(self):
        """Filter queryset based on request parameters."""
        queryset = super().get_queryset()
        
        # Filter for bills that have votes (vote_date is not null)
        has_votes = self.request.query_params.get('has_votes', None)
        if has_votes and has_votes.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(vote_date__isnull=False)
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return BillDetailSerializer
        return BillListSerializer
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Return bill statistics grouped by status."""
        from django.db.models import Count
        
        # Get the active session or latest session
        session_id = request.query_params.get('session', None)
        if session_id:
            queryset = Bill.objects.filter(session_id=session_id)
        else:
            # Get the latest session
            latest_session = ParliamentSession.objects.filter(is_active=True).first()
            if latest_session:
                queryset = Bill.objects.filter(session=latest_session)
            else:
                queryset = Bill.objects.all()
        
        # Count bills by status
        status_counts = queryset.values('status').annotate(count=Count('id')).order_by('status')
        
        # Format the results
        stats = {
            'awaiting_first_reading': 0,
            'in_committee': 0,
            'awaiting_second_reading': 0,
            'awaiting_third_reading': 0,
            'passed': 0,
            'rejected': 0,
            'withdrawn': 0,
            'question_sent': 0,
            'question_answered': 0,
            'total': queryset.count()
        }
        
        for item in status_counts:
            stats[item['status']] = item['count']
        
        # Count bills by type
        type_counts = queryset.values('bill_type').annotate(count=Count('id')).order_by('bill_type')
        bill_types = {item['bill_type']: item['count'] for item in type_counts}
        
        # Count bills by submitter type
        submitter_counts = queryset.values('submitter_type').annotate(count=Count('id')).order_by('submitter_type')
        submitter_types = {item['submitter_type']: item['count'] for item in submitter_counts}
        
        return Response({
            'status_counts': stats,
            'bill_type_counts': bill_types,
            'submitter_type_counts': submitter_types
        })
    
    @action(detail=True, methods=['get'])
    def amendments(self, request, pk=None):
        """Return amendments for this bill."""
        bill = self.get_object()
        amendments = bill.amendments.all()
        page = self.paginate_queryset(amendments)
        if page is not None:
            serializer = AmendmentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = AmendmentSerializer(amendments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def speeches(self, request, pk=None):
        """Return speeches related to this bill."""
        bill = self.get_object()
        speeches = bill.speeches.all()
        page = self.paginate_queryset(speeches)
        if page is not None:
            serializer = SpeechSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = SpeechSerializer(speeches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def votes(self, request, pk=None):
        """Return votes for this bill."""
        bill = self.get_object()
        votes = bill.votes.all()
        page = self.paginate_queryset(votes)
        if page is not None:
            serializer = VoteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = VoteSerializer(votes, many=True)
        return Response(serializer.data)


class AmendmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing amendments."""
    
    queryset = Amendment.objects.all()
    serializer_class = AmendmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['bill', 'status', 'proposed_by']
    search_fields = ['title', 'text']
    ordering_fields = ['date_proposed']


class VoteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing votes."""
    
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['bill', 'mp', 'vote', 'session']
    ordering_fields = ['vote_date']


class SpeechViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing speeches."""
    
    queryset = Speech.objects.all()
    serializer_class = SpeechSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['mp', 'bill', 'session']
    search_fields = ['title', 'text']
    ordering_fields = ['date', 'sentiment_score']


class MPInterestViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing MP interests."""
    
    queryset = MPInterest.objects.all()
    serializer_class = MPInterestSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['mp', 'mp__party']
    search_fields = ['board_positions', 'paid_work', 'business_activities', 'company_ownership', 'other_positions'] 
"""
Views for engagement features.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import (
    DiscussionForum,
    DiscussionThread,
    DiscussionPost,
    Whistleblowing,
    Notification
)
from .serializers import (
    DiscussionForumListSerializer,
    DiscussionForumDetailSerializer,
    DiscussionThreadListSerializer,
    DiscussionThreadDetailSerializer,
    DiscussionPostSerializer,
    WhistleblowingCreateSerializer,
    WhistleblowingDetailSerializer,
    NotificationSerializer
)
from .permissions import (
    IsModeratorOrReadOnly,
    IsOwnerOrReadOnly,
    IsOwnerOrModerator
)


class DiscussionForumViewSet(viewsets.ModelViewSet):
    """ViewSet for discussion forums."""
    
    queryset = DiscussionForum.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsModeratorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'related_bill', 'related_mp', 'related_topic']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return DiscussionForumDetailSerializer
        return DiscussionForumListSerializer
    
    @action(detail=True, methods=['get'])
    def threads(self, request, pk=None):
        """Return threads in this forum."""
        forum = self.get_object()
        threads = forum.threads.all()
        page = self.paginate_queryset(threads)
        if page is not None:
            serializer = DiscussionThreadListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DiscussionThreadListSerializer(threads, many=True)
        return Response(serializer.data)


class DiscussionThreadViewSet(viewsets.ModelViewSet):
    """ViewSet for discussion threads."""
    
    queryset = DiscussionThread.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrModerator]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['forum', 'is_pinned', 'is_locked', 'created_by']
    search_fields = ['title']
    ordering_fields = ['created_at', 'last_activity']
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return DiscussionThreadDetailSerializer
        return DiscussionThreadListSerializer
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle the pinned status of a thread."""
        thread = self.get_object()
        forum = thread.forum
        
        # Check if user is a moderator of the forum (if forum exists) or staff
        if forum and request.user not in forum.moderators.all() and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to pin/unpin threads."},
                status=status.HTTP_403_FORBIDDEN
            )
        elif not forum and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to pin/unpin threads."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        thread.is_pinned = not thread.is_pinned
        thread.save()
        return Response({"is_pinned": thread.is_pinned})
    
    @action(detail=True, methods=['post'])
    def toggle_lock(self, request, pk=None):
        """Toggle the locked status of a thread."""
        thread = self.get_object()
        forum = thread.forum
        
        # Check if user is a moderator of the forum (if forum exists) or staff
        if forum and request.user not in forum.moderators.all() and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to lock/unlock threads."},
                status=status.HTTP_403_FORBIDDEN
            )
        elif not forum and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to lock/unlock threads."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        thread.is_locked = not thread.is_locked
        thread.save()
        return Response({"is_locked": thread.is_locked})


class DiscussionPostViewSet(viewsets.ModelViewSet):
    """ViewSet for discussion posts."""
    
    queryset = DiscussionPost.objects.all()
    serializer_class = DiscussionPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['thread', 'author', 'is_approved']
    ordering_fields = ['created_at']
    
    def perform_create(self, serializer):
        """Set the author field to the current user."""
        thread = get_object_or_404(DiscussionThread, pk=self.request.data.get('thread'))
        
        # Check if thread is locked
        if thread.is_locked:
            return Response(
                {"detail": "This thread is locked and cannot receive new posts."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if forum requires approval (if forum exists)
        if thread.forum and thread.forum.requires_approval:
            serializer.save(author=self.request.user, is_approved=False)
        else:
            serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        """Update a post and track edit history."""
        post = self.get_object()
        
        # Create edit history if it doesn't exist
        if not post.edit_history:
            post.edit_history = []
        
        # Add current content to edit history
        post.edit_history.append({
            'content': post.content,
            'edited_at': post.updated_at.isoformat()
        })
        
        # Save with is_edited flag
        serializer.save(is_edited=True, edit_history=post.edit_history)


class WhistleblowingViewSet(viewsets.ModelViewSet):
    """ViewSet for whistleblowing reports."""
    
    queryset = Whistleblowing.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'related_mp', 'related_party']
    search_fields = ['title', 'description']
    ordering_fields = ['submitted_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return WhistleblowingCreateSerializer
        return WhistleblowingDetailSerializer
    
    def get_queryset(self):
        """Return reports based on user permissions."""
        user = self.request.user
        
        # Staff can see all reports
        if user.is_staff:
            return self.queryset
        
        # Regular users can only see their own reports
        return self.queryset.filter(submitted_by=user)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user notifications."""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'is_read']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """Return notifications for the current user."""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "notification marked as read"})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read."""
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        return Response({"status": f"{notifications.count()} notifications marked as read"}) 
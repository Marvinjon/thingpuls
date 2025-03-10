"""
URL patterns for the engagement app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DiscussionForumViewSet,
    DiscussionThreadViewSet,
    DiscussionPostViewSet,
    WhistleblowingViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register('forums', DiscussionForumViewSet)
router.register('threads', DiscussionThreadViewSet)
router.register('posts', DiscussionPostViewSet)
router.register('whistleblowing', WhistleblowingViewSet)
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
] 
"""
URL patterns for the users app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserRegistrationView, UserActivityViewSet

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('activity', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
] 
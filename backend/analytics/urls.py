"""
URL patterns for the analytics app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardConfigurationViewSet,
    SavedSearchViewSet,
    AnalyticsReportViewSet,
    DataExportViewSet
)

router = DefaultRouter()
router.register('dashboard', DashboardConfigurationViewSet, basename='dashboard')
router.register('saved-searches', SavedSearchViewSet, basename='saved-search')
router.register('reports', AnalyticsReportViewSet, basename='report')
router.register('exports', DataExportViewSet, basename='export')

urlpatterns = [
    path('', include(router.urls)),
] 
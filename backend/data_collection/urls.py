"""
URL patterns for the data collection app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DataSourceViewSet,
    DataCollectionTaskViewSet,
    DataCollectionRunViewSet
)

router = DefaultRouter()
router.register('sources', DataSourceViewSet)
router.register('tasks', DataCollectionTaskViewSet)
router.register('runs', DataCollectionRunViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 
"""
URL patterns for the parliament app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PoliticalPartyViewSet,
    TopicViewSet,
    ParliamentSessionViewSet,
    MPViewSet,
    BillViewSet,
    AmendmentViewSet,
    VoteViewSet,
    SpeechViewSet
)

router = DefaultRouter()
router.register('parties', PoliticalPartyViewSet)
router.register('topics', TopicViewSet)
router.register('sessions', ParliamentSessionViewSet)
router.register('mps', MPViewSet)
router.register('bills', BillViewSet)
router.register('amendments', AmendmentViewSet)
router.register('votes', VoteViewSet)
router.register('speeches', SpeechViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 
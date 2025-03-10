"""politico URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import permissions


class APIRoot(APIView):
    """Root API endpoint providing links to all available endpoints."""
    
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access
    
    def get(self, request, format=None):
        return Response({
            'auth': reverse('token_obtain_pair', request=request, format=format),
            'auth-refresh': reverse('token_refresh', request=request, format=format),
            'users': request.build_absolute_uri('auth/users/'),
            'parliament': request.build_absolute_uri('parliament/'),
            'engagement': request.build_absolute_uri('engagement/'),
            'analytics': request.build_absolute_uri('analytics/'),
        })

# Alternative method using RedirectView (commented out)
# from django.views.generic import RedirectView
# urlpatterns = [
#     path('api/v1/', RedirectView.as_view(url='/api/v1/parliament/'), name='api-root'),
#     # ... other paths
# ]

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API root endpoint
    path('api/v1/', APIRoot.as_view(), name='api-root'),
    
    # API endpoints
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/parliament/', include('parliament.urls')),
    path('api/v1/engagement/', include('engagement.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    
    # JWT authentication
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 
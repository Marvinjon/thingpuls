"""
Views for the users app.
"""

from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import get_user_model
from .models import UserActivity
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    UserActivitySerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """API view for user registration."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user accounts."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Set custom permissions for each action."""
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Return objects for the current authenticated user only."""
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Return the authenticated user's details."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], serializer_class=PasswordChangeSerializer)
    def change_password(self, request):
        """Change password."""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def update_notification_preferences(self, request):
        """Update notification preferences."""
        user = request.user
        
        # Update notification preferences
        for pref in ['notify_bill_updates', 'notify_mp_updates', 'notify_votes', 'notify_discussions']:
            if pref in request.data:
                setattr(user, pref, request.data[pref])
        
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing user activity."""
    
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return objects for the current authenticated user only."""
        return UserActivity.objects.filter(user=self.request.user) 
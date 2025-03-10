"""
Serializers for the users app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserActivity

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user objects."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'bio', 
                  'profile_image', 'is_verified', 'date_joined', 'last_active',
                  'notify_bill_updates', 'notify_mp_updates', 
                  'notify_votes', 'notify_discussions')
        read_only_fields = ('id', 'email', 'is_verified', 'date_joined', 'last_active')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password_confirm')
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        """Create a new user with encrypted password."""
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    current_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    confirm_new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    def validate(self, attrs):
        """Validate that new passwords match and current password is correct."""
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        
        return attrs


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activity objects."""
    
    class Meta:
        model = UserActivity
        fields = ('id', 'user', 'activity_type', 'activity_data', 'timestamp')
        read_only_fields = ('id', 'user', 'timestamp') 
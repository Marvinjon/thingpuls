"""
Custom permissions for engagement features.
"""

from rest_framework import permissions


class IsModeratorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow moderators to edit forums.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to moderators or staff
        return request.user.is_staff or request.user in obj.moderators.all()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsOwnerOrModerator(permissions.BasePermission):
    """
    Custom permission to allow owners or moderators to edit objects.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Check if user is owner
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        # Check if user is moderator of the forum
        if hasattr(obj, 'forum') and request.user in obj.forum.moderators.all():
            return True
        
        return False 
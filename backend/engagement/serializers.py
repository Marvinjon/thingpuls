"""
Serializers for engagement models.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    DiscussionForum,
    DiscussionThread,
    DiscussionPost,
    Whistleblowing,
    Notification
)
from parliament.serializers import (
    BillListSerializer,
    MPListSerializer,
    TopicSerializer
)
from parliament.models import Topic

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer for basic user information."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile_image')


class DiscussionForumListSerializer(serializers.ModelSerializer):
    """Serializer for listing discussion forums."""
    
    thread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionForum
        fields = ('id', 'title', 'slug', 'description', 'created_at', 
                  'is_active', 'thread_count')
    
    def get_thread_count(self, obj):
        """Return the number of threads in the forum."""
        return obj.threads.count()


class DiscussionForumDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed discussion forum information."""
    
    related_bill = BillListSerializer(read_only=True)
    related_mp = MPListSerializer(read_only=True)
    related_topic = TopicSerializer(read_only=True)
    moderators = UserBasicSerializer(many=True, read_only=True)
    
    class Meta:
        model = DiscussionForum
        fields = '__all__'


class DiscussionThreadListSerializer(serializers.ModelSerializer):
    """Serializer for listing discussion threads."""
    
    created_by = UserBasicSerializer(read_only=True)
    post_count = serializers.SerializerMethodField()
    topics = serializers.PrimaryKeyRelatedField(many=True, queryset=Topic.objects.all(), required=False, allow_empty=True, allow_null=True)
    
    class Meta:
        model = DiscussionThread
        fields = ('id', 'forum', 'title', 'slug', 'created_by', 'created_at',
                  'is_pinned', 'is_locked', 'last_activity', 'post_count', 'topics')
        read_only_fields = ('slug',)
    
    def get_post_count(self, obj):
        """Return the number of posts in the thread."""
        return obj.posts.count()
    
    def create(self, validated_data):
        """Create a new thread and handle ManyToMany topics field."""
        topics = validated_data.pop('topics', None)
        # Ensure topics is a list (handle case where it might be None or empty)
        if topics is None:
            topics = []
        thread = DiscussionThread.objects.create(**validated_data)
        # Set topics (even if empty list, this is fine for ManyToMany)
        thread.topics.set(topics)
        return thread
    
    def to_representation(self, instance):
        """Override to include topic details in read operations."""
        representation = super().to_representation(instance)
        if instance.pk:
            representation['topics'] = TopicSerializer(instance.topics.all(), many=True).data
        return representation


class DiscussionPostSerializer(serializers.ModelSerializer):
    """Serializer for discussion posts."""
    
    author = UserBasicSerializer(read_only=True)
    score = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    parent_author = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionPost
        fields = ('id', 'thread', 'parent', 'author', 'content', 'created_at', 
                  'updated_at', 'is_edited', 'upvotes', 'downvotes', 'score', 'user_vote',
                  'replies', 'reply_count', 'parent_author')
        read_only_fields = ('is_edited', 'edit_history', 'upvotes', 'downvotes')
    
    def get_score(self, obj):
        """Calculate the net score (upvotes - downvotes)."""
        return obj.get_score()
    
    def get_user_vote(self, obj):
        """Get the current user's vote status."""
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.get_user_vote(request.user)
        return None
    
    def get_replies(self, obj):
        """Get nested replies for this post."""
        # Limit depth to prevent infinite recursion
        depth = self.context.get('depth', 0)
        if depth > 10:  # Maximum nesting depth
            return []
        
        replies = obj.replies.all().order_by('created_at')
        context = {**self.context, 'depth': depth + 1}
        return DiscussionPostSerializer(replies, many=True, context=context).data
    
    def get_reply_count(self, obj):
        """Get the total number of replies (including nested)."""
        return obj.replies.count()
    
    def get_parent_author(self, obj):
        """Get the author of the parent post if this is a reply."""
        if obj.parent:
            return UserBasicSerializer(obj.parent.author).data
        return None
    
    def create(self, validated_data):
        """Create a new post."""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class DiscussionThreadDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed discussion thread information."""
    
    created_by = UserBasicSerializer(read_only=True)
    forum = DiscussionForumListSerializer(read_only=True)
    posts = DiscussionPostSerializer(many=True, read_only=True)
    topics = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = DiscussionThread
        fields = ('id', 'forum', 'title', 'slug', 'created_by', 'created_at',
                  'is_pinned', 'is_locked', 'last_activity', 'posts', 'topics')


class WhistleblowingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating whistleblowing reports."""
    
    class Meta:
        model = Whistleblowing
        fields = ('title', 'description', 'is_anonymous', 'category',
                  'related_mp', 'related_party', 'evidence')
    
    def create(self, validated_data):
        """Create a new whistleblowing report."""
        user = self.context['request'].user
        if validated_data.get('is_anonymous', False):
            # If anonymous, don't store the user
            validated_data['submitted_by'] = None
        else:
            validated_data['submitted_by'] = user
        return super().create(validated_data)


class WhistleblowingDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed whistleblowing report information."""
    
    related_mp = MPListSerializer(read_only=True)
    assigned_to = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Whistleblowing
        fields = ('id', 'title', 'description', 'submitted_at', 'status',
                  'is_anonymous', 'category', 'related_mp', 'related_party',
                  'evidence', 'assigned_to')
        read_only_fields = ('submitted_at', 'assigned_to')


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications."""
    
    class Meta:
        model = Notification
        fields = ('id', 'type', 'title', 'message', 'created_at', 'is_read',
                  'link', 'related_object_type', 'related_object_id')
        read_only_fields = ('created_at',) 
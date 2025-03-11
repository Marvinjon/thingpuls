"""
Serializers for parliamentary data.
"""

from rest_framework import serializers
from .models import (
    PoliticalParty, 
    Topic, 
    ParliamentSession, 
    MP, 
    Bill, 
    Amendment, 
    Vote, 
    Speech
)


class PoliticalPartySerializer(serializers.ModelSerializer):
    """Serializer for political party objects."""
    
    class Meta:
        model = PoliticalParty
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for policy topic objects."""
    
    class Meta:
        model = Topic
        fields = '__all__'


class ParliamentSessionSerializer(serializers.ModelSerializer):
    """Serializer for parliamentary session objects."""
    
    class Meta:
        model = ParliamentSession
        fields = '__all__'


class MPListSerializer(serializers.ModelSerializer):
    """Serializer for listing MP objects."""
    
    party = PoliticalPartySerializer(read_only=True)
    
    class Meta:
        model = MP
        fields = ('id', 'first_name', 'last_name', 'slug', 'party', 
                  'constituency', 'photo', 'active')


class MPDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed MP objects."""
    
    party = PoliticalPartySerializer(read_only=True)
    
    class Meta:
        model = MP
        fields = '__all__'


class AmendmentSerializer(serializers.ModelSerializer):
    """Serializer for amendment objects."""
    
    proposed_by = MPListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Amendment
        fields = '__all__'


class BillListSerializer(serializers.ModelSerializer):
    """Serializer for listing bill objects."""
    
    topics = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bill
        fields = ('id', 'title', 'slug', 'status', 'introduced_date', 'topics', 'url', 'description', 'althingi_id')


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for vote objects."""
    
    mp = MPListSerializer(read_only=True)
    bill = BillListSerializer(read_only=True)
    session = ParliamentSessionSerializer(read_only=True)
    
    class Meta:
        model = Vote
        fields = '__all__'


class SpeechSerializer(serializers.ModelSerializer):
    """Serializer for speech objects."""
    
    mp = MPListSerializer(read_only=True)
    
    class Meta:
        model = Speech
        fields = '__all__'


class BillDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed bill objects."""
    
    sponsors = MPListSerializer(many=True, read_only=True)
    topics = TopicSerializer(many=True, read_only=True)
    amendments = AmendmentSerializer(many=True, read_only=True)
    votes = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
    
    def get_votes(self, obj):
        """Return vote statistics and individual votes."""
        votes = obj.votes.all()
        
        # Get vote counts
        yes_votes = votes.filter(vote='yes')
        no_votes = votes.filter(vote='no')
        abstain_votes = votes.filter(vote='abstain')
        absent_votes = votes.filter(vote='absent')
        
        # Create serializer for individual votes
        vote_serializer = VoteSerializer(many=True)
        
        stats = {
            'yes': yes_votes.count(),
            'no': no_votes.count(),
            'abstain': abstain_votes.count(),
            'absent': absent_votes.count(),
            'total': votes.count(),
            'yes_votes': vote_serializer.to_representation(yes_votes),
            'no_votes': vote_serializer.to_representation(no_votes),
            'abstain_votes': vote_serializer.to_representation(abstain_votes),
            'absent_votes': vote_serializer.to_representation(absent_votes)
        }
        return stats 
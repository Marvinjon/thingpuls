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
    
    party_name = serializers.CharField(source='party.name', read_only=True)
    
    class Meta:
        model = MP
        fields = ('id', 'first_name', 'last_name', 'slug', 'party', 'party_name', 
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


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for vote objects."""
    
    mp = MPListSerializer(read_only=True)
    
    class Meta:
        model = Vote
        fields = '__all__'


class SpeechSerializer(serializers.ModelSerializer):
    """Serializer for speech objects."""
    
    mp = MPListSerializer(read_only=True)
    
    class Meta:
        model = Speech
        fields = '__all__'


class BillListSerializer(serializers.ModelSerializer):
    """Serializer for listing bill objects."""
    
    sponsors_count = serializers.SerializerMethodField()
    primary_sponsor = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = ('id', 'title', 'slug', 'status', 'introduced_date', 'sponsors_count', 
                  'primary_sponsor', 'last_update')
    
    def get_sponsors_count(self, obj):
        """Return the number of sponsors."""
        return obj.sponsors.count()
    
    def get_primary_sponsor(self, obj):
        """Return the primary sponsor if available."""
        primary_sponsor = obj.sponsors.first()
        if primary_sponsor:
            return {
                'id': primary_sponsor.id,
                'name': f"{primary_sponsor.first_name} {primary_sponsor.last_name}",
                'party': primary_sponsor.party.abbreviation
            }
        return None


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
        """Return vote statistics."""
        votes = obj.votes.all()
        stats = {
            'yes': votes.filter(vote='yes').count(),
            'no': votes.filter(vote='no').count(),
            'abstain': votes.filter(vote='abstain').count(),
            'absent': votes.filter(vote='absent').count(),
            'total': votes.count()
        }
        return stats 
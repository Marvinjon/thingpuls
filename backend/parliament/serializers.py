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
    Speech,
    MPInterest
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
                  'constituency', 'photo', 'active', 'image_url')


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
    cosponsors = MPListSerializer(many=True, read_only=True)
    topics = TopicSerializer(many=True, read_only=True)
    amendments = AmendmentSerializer(many=True, read_only=True)
    votes = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
    
    def get_votes(self, obj):
        """Return vote statistics grouped by voting session with individual MP votes."""
        votes = obj.votes.all().select_related('mp', 'mp__party')
        
        if not votes.exists():
            return []
        
        # Group votes by voting session (using althingi_voting_id and vote_date)
        voting_sessions = {}
        for vote in votes:
            session_key = vote.althingi_voting_id or f"session_{vote.vote_date}"
            if session_key not in voting_sessions:
                voting_sessions[session_key] = {
                    'id': session_key,
                    'title': f"Atkvæðagreiðsla {vote.vote_date.strftime('%d/%m/%Y')}",
                    'vote_date': vote.vote_date,
                    'althingi_voting_id': vote.althingi_voting_id,
                    'votes': []
                }
            voting_sessions[session_key]['votes'].append(vote)
        
        # Calculate statistics for each voting session and sort by date
        result = []
        for session_data in sorted(voting_sessions.values(), key=lambda x: x['vote_date'], reverse=True):
            session_votes = session_data['votes']
            
            # Count votes by type
            yes_votes = [v for v in session_votes if v.vote == 'yes']
            no_votes = [v for v in session_votes if v.vote == 'no']
            abstain_votes = [v for v in session_votes if v.vote == 'abstain']
            absent_votes = [v for v in session_votes if v.vote == 'absent']
            
            # Create MP vote details
            def format_mp_vote(vote):
                return {
                    'mp_id': vote.mp.id,
                    'mp_name': vote.mp.full_name,
                    'mp_slug': vote.mp.slug,
                    'party': vote.mp.party.abbreviation if vote.mp.party else 'Óháður',
                    'party_color': vote.mp.party.color if vote.mp.party else '#808080',
                    'vote': vote.vote,
                    'image_url': vote.mp.image_url
                }
            
            result.append({
                'id': session_data['id'],
                'title': session_data['title'],
                'vote_date': session_data['vote_date'].isoformat() if session_data['vote_date'] else None,
                'althingi_voting_id': session_data['althingi_voting_id'],
                'yes_count': len(yes_votes),
                'no_count': len(no_votes),
                'abstain_count': len(abstain_votes),
                'absent_count': len(absent_votes),
                'total_count': len(session_votes),
                'yes_votes': [format_mp_vote(v) for v in yes_votes],
                'no_votes': [format_mp_vote(v) for v in no_votes],
                'abstain_votes': [format_mp_vote(v) for v in abstain_votes],
                'absent_votes': [format_mp_vote(v) for v in absent_votes]
            })
        
        return result 


class MPInterestSerializer(serializers.ModelSerializer):
    """Serializer for MP interest objects."""
    
    mp = MPListSerializer(read_only=True)
    
    class Meta:
        model = MPInterest
        fields = '__all__' 
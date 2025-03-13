"""
Models for parliamentary data.
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone


class PoliticalParty(models.Model):
    """Model for political parties in Iceland."""
    
    name = models.CharField(max_length=100)
    abbreviation = models.CharField(max_length=20)
    althingi_id = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="Party ID from the Alþingi database")
    logo = models.ImageField(upload_to='party_logos/', null=True, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    founding_date = models.DateField(null=True, blank=True)
    color = models.CharField(max_length=20, blank=True, help_text="Party color in hex format (e.g., #FF0000)")
    
    class Meta:
        verbose_name_plural = 'Political parties'
    
    def __str__(self):
        return self.name


class Topic(models.Model):
    """Model for policy topics and issue areas."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    keywords = models.JSONField(default=list, blank=True, help_text="List of keywords used to identify this topic")
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class ParliamentSession(models.Model):
    """Model for parliamentary sessions."""
    
    session_number = models.IntegerField(help_text="Number of the parliamentary session")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-session_number']
    
    def __str__(self):
        return f"Parliamentary Session {self.session_number}"


class MP(models.Model):
    """Model for Members of Parliament."""
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=200, unique=True)
    althingi_id = models.IntegerField(unique=True, help_text="MP ID from the Alþingi database")
    party = models.ForeignKey(PoliticalParty, on_delete=models.SET_NULL, null=True, related_name='mps')
    constituency = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='mp_photos/', null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    social_media_links = models.JSONField(null=True, blank=True)
    active = models.BooleanField(default=True)
    
    # Service periods
    first_elected = models.DateField(null=True, blank=True)
    current_position_started = models.DateField(null=True, blank=True)
    end_of_service = models.DateField(null=True, blank=True)
    
    # Statistics and analytics
    speech_count = models.IntegerField(default=0)
    bills_sponsored = models.IntegerField(default=0)
    bills_cosponsored = models.IntegerField(default=0)
    
    image_url = models.URLField(blank=True, help_text="URL to MP's image on Althingi website")
    
    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name = 'MP'
        verbose_name_plural = 'MPs'
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided."""
        if not self.slug:
            self.slug = slugify(f"{self.first_name}-{self.last_name}")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        """Return the MP's full name."""
        return f"{self.first_name} {self.last_name}"


class MPInterest(models.Model):
    """
    Model for MPs' financial interests and other disclosures as reported
    on the Althingi website.
    """
    mp = models.ForeignKey(MP, on_delete=models.CASCADE, related_name='interests')
    last_updated = models.DateTimeField(auto_now=True)
    
    # Financial interests categories
    board_positions = models.TextField(blank=True, help_text="Paid board memberships in private or public companies")
    paid_work = models.TextField(blank=True, help_text="Paid work or projects (other than MP duties)")
    business_activities = models.TextField(blank=True, help_text="Business activities conducted alongside parliamentary work")
    financial_support = models.TextField(blank=True, help_text="Financial support or contributions from domestic and foreign entities")
    gifts = models.TextField(blank=True, help_text="Gifts valued over 50,000 ISK and likely provided due to MP position")
    trips = models.TextField(blank=True, help_text="Domestic and foreign trips related to parliamentary duties")
    debt_forgiveness = models.TextField(blank=True, help_text="Debt forgiveness and favorable changes to loan terms")
    real_estate = models.TextField(blank=True, help_text="Real estate ownership (excluding personal residence)")
    company_ownership = models.TextField(blank=True, help_text="Companies, savings banks, or self-owned institutions in which the MP owns shares")
    former_employer_agreements = models.TextField(blank=True, help_text="Financial agreements with former employers")
    future_employer_agreements = models.TextField(blank=True, help_text="Employment agreements with future employers")
    other_positions = models.TextField(blank=True, help_text="Board memberships and other positions of trust for interest groups")
    
    # The URL for the interests page
    source_url = models.URLField(blank=True, help_text="URL to the interests declaration on the Althingi website")
    
    class Meta:
        verbose_name = "MP's Interest Declaration"
        verbose_name_plural = "MP Interest Declarations"
    
    def __str__(self):
        return f"{self.mp.full_name}'s Interests"


class Bill(models.Model):
    """Model for parliamentary bills and legislation."""
    
    STATUS_CHOICES = [
        ('introduced', 'Introduced'),
        ('in_committee', 'In Committee'),
        ('in_debate', 'In Debate'),
        ('amended', 'Amended'),
        ('passed', 'Passed'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn')
    ]
    
    althingi_id = models.IntegerField()
    title = models.CharField(max_length=500)
    slug = models.CharField(max_length=200)  # Increased from 50
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='introduced')
    introduced_date = models.DateField()
    session = models.ForeignKey(ParliamentSession, on_delete=models.CASCADE, related_name='bills')
    topics = models.ManyToManyField(Topic, related_name='bills')
    url = models.URLField(max_length=500, blank=True)
    
    # Add sponsors and cosponsors
    primary_sponsor = models.ForeignKey('MP', on_delete=models.SET_NULL, null=True, blank=True, related_name='sponsored_bills')
    cosponsors = models.ManyToManyField('MP', related_name='cosponsored_bills', blank=True)
    
    class Meta:
        unique_together = ('session', 'slug')  # Make slug unique per session
        ordering = ['-introduced_date']
    
    def __str__(self):
        return f"{self.title} ({self.session.session_number}-{self.althingi_id})"


class Amendment(models.Model):
    """Model for amendments to bills."""
    
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='amendments')
    title = models.CharField(max_length=255)
    text = models.TextField()
    proposed_by = models.ManyToManyField(MP, related_name='proposed_amendments')
    date_proposed = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('proposed', 'Proposed'),
        ('adopted', 'Adopted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ], default='proposed')
    
    class Meta:
        ordering = ['-date_proposed']
    
    def __str__(self):
        return f"Amendment to {self.bill.title}"


class Vote(models.Model):
    """Model for parliamentary votes."""
    
    VOTE_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('abstain', 'Abstain'),
        ('absent', 'Absent'),
    ]
    
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='votes')
    mp = models.ForeignKey(MP, on_delete=models.CASCADE, related_name='voting_record')
    vote = models.CharField(max_length=10, choices=VOTE_CHOICES)
    vote_date = models.DateField()
    session = models.ForeignKey(ParliamentSession, on_delete=models.CASCADE, related_name='votes')
    
    class Meta:
        ordering = ['-vote_date']
        unique_together = ('bill', 'mp')
    
    def __str__(self):
        return f"{self.mp} voted {self.vote} on {self.bill.title}"


class Speech(models.Model):
    """Model for speeches in parliamentary debates."""
    
    mp = models.ForeignKey(MP, on_delete=models.CASCADE, related_name='speeches')
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='speeches', null=True, blank=True)
    session = models.ForeignKey(ParliamentSession, on_delete=models.CASCADE, related_name='speeches')
    date = models.DateField()
    title = models.CharField(max_length=255, blank=True)
    text = models.TextField(blank=True)
    
    # New fields for Alþingi data
    mp_althingi_id = models.IntegerField(null=True, blank=True, help_text="MP ID from the Alþingi database")
    althingi_bill_id = models.IntegerField(null=True, blank=True, help_text="Bill number in Alþingi")
    speech_type = models.CharField(max_length=50, blank=True, help_text="Type of speech (e.g., ræða, andsvar)")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(help_text="Duration in seconds", null=True, blank=True)
    
    # URLs for various resources
    audio_url = models.URLField(blank=True, help_text="URL to audio recording")
    video_url = models.URLField(blank=True, help_text="URL to video recording")
    transcript_url = models.URLField(blank=True, help_text="URL to transcript")
    xml_url = models.URLField(blank=True, help_text="URL to XML version")
    html_url = models.URLField(blank=True, help_text="URL to HTML version")
    
    # For sentiment and topic analysis
    sentiment_score = models.FloatField(null=True, blank=True)
    keywords = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date', '-start_time']
        verbose_name_plural = 'Speeches'
    
    def __str__(self):
        return f"{self.mp} speech on {self.date} ({self.speech_type})" 
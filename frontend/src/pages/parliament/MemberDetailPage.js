import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WebIcon from '@mui/icons-material/Web';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TodayIcon from '@mui/icons-material/Today';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import { parliamentService } from '../../services/api';

const MemberDetailPage = () => {
  const { id } = useParams(); // MP slug from URL
  const [mp, setMp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Tab content data
  const [speeches, setSpeeches] = useState([]);
  const [bills, setBills] = useState([]);
  const [votingRecord, setVotingRecord] = useState([]);
  const [interests, setInterests] = useState(null);
  const [speechesLoading, setSpeechesLoading] = useState(false);
  const [billsLoading, setBillsLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [interestsLoading, setInterestsLoading] = useState(false);
  
  useEffect(() => {
    const fetchMpData = async () => {
      setLoading(true);
      try {
        const response = await parliamentService.getMemberById(id);
        setMp(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching MP details:', err);
        setError('Failed to load MP details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMpData();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load data based on the selected tab
    if (newValue === 1 && speeches.length === 0) {
      fetchSpeeches();
    } else if (newValue === 2 && bills.length === 0) {
      fetchBills();
    } else if (newValue === 3 && votingRecord.length === 0) {
      fetchVotingRecord();
    } else if (newValue === 4 && interests === null) {
      fetchInterests();
    }
  };
  
  const fetchSpeeches = async () => {
    setSpeechesLoading(true);
    try {
      const response = await parliamentService.getMemberSpeeches(id);
      setSpeeches(response.data.results || []);
    } catch (err) {
      console.error('Error fetching speeches:', err);
      // Mock data for development
      setSpeeches([
        {
          id: 101,
          title: 'Response to climate change proposals',
          date: '2023-05-15',
          bill: { id: 45, title: 'Climate Change Action Plan' },
          duration: 720,
          sentiment_score: 0.65
        },
        {
          id: 102,
          title: 'Budget discussion',
          date: '2023-04-02',
          bill: { id: 32, title: 'Annual Budget 2023' },
          duration: 540,
          sentiment_score: 0.32
        }
      ]);
    } finally {
      setSpeechesLoading(false);
    }
  };
  
  const fetchBills = async () => {
    setBillsLoading(true);
    try {
      const response = await parliamentService.getMemberBills(id);
      setBills(response.data.results || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
      // Mock data for development
      setBills([
        {
          id: 45,
          title: 'Climate Change Action Plan',
          status: 'passed',
          introduced_date: '2023-03-10',
          primary_sponsor: {
            id: 1,
            name: 'Katrín Jakobsdóttir',
            party: 'V'
          },
          sponsors_count: 5
        },
        {
          id: 46,
          title: 'Renewable Energy Investment Act',
          status: 'in_committee',
          introduced_date: '2023-05-02',
          primary_sponsor: {
            id: 1,
            name: 'Katrín Jakobsdóttir',
            party: 'V'
          },
          sponsors_count: 3
        }
      ]);
    } finally {
      setBillsLoading(false);
    }
  };
  
  const fetchVotingRecord = async () => {
    setVotingLoading(true);
    try {
      const response = await parliamentService.getMemberVotingRecord(id);
      setVotingRecord(response.data.results || []);
    } catch (err) {
      console.error('Error fetching voting record:', err);
      // Mock data for development
      setVotingRecord([
        {
          id: 201,
          bill: { id: 45, title: 'Climate Change Action Plan' },
          vote: 'yes',
          vote_date: '2023-04-05'
        },
        {
          id: 202,
          bill: { id: 46, title: 'Renewable Energy Investment Act' },
          vote: 'yes',
          vote_date: '2023-05-18'
        },
        {
          id: 203,
          bill: { id: 32, title: 'Annual Budget 2023' },
          vote: 'no',
          vote_date: '2023-04-10'
        }
      ]);
    } finally {
      setVotingLoading(false);
    }
  };
  
  const fetchInterests = async () => {
    setInterestsLoading(true);
    try {
      const response = await parliamentService.getMemberInterests(id);
      setInterests(response.data);
    } catch (err) {
      console.error('Error fetching interests:', err);
      // Mock data for development
      setInterests([
        {
          id: 1,
          name: 'Climate Change',
          description: 'Interest in climate change policies and actions'
        },
        {
          id: 2,
          name: 'Renewable Energy',
          description: 'Interest in renewable energy sources'
        }
      ]);
    } finally {
      setInterestsLoading(false);
    }
  };
  
  // Format the status for display
  const formatStatus = (status) => {
    const statusMap = {
      'introduced': 'Lagt fram',
      'in_committee': 'Í nefnd',
      'in_debate': 'Í umræðu',
      'passed': 'Samþykkt',
      'rejected': 'Hafnað',
      'withdrawn': 'Dregið til baka'
    };
    return statusMap[status] || status;
  };
  
  // Format the vote type for display
  const formatVote = (vote) => {
    const voteMap = {
      'yes': 'Já',
      'no': 'Nei',
      'abstain': 'Sat hjá',
      'absent': 'Fjarverandi'
    };
    return voteMap[vote] || vote;
  };
  
  // Get color for vote chip
  const getVoteColor = (vote) => {
    const colorMap = {
      'yes': 'success',
      'no': 'error',
      'abstain': 'warning',
      'absent': 'default'
    };
    return colorMap[vote] || 'default';
  };
  
  // Get color for bill status chip
  const getStatusColor = (status) => {
    const colorMap = {
      'introduced': 'info',
      'in_committee': 'info',
      'in_debate': 'warning',
      'amended': 'warning',
      'passed': 'success',
      'rejected': 'error',
      'withdrawn': 'default'
    };
    return colorMap[status] || 'default';
  };
  
  // Helper function to format duration from seconds to readable format
  const formatDuration = (seconds) => {
    if (!seconds) return 'Engin gögn';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} mínútur`;
    } else {
      return `${hours} klst ${minutes} mín`;
    }
  };

  // Helper function to format speech type
  const formatSpeechType = (type) => {
    const typeMap = {
      'ræða': 'Ræða',
      'andsvar': 'Andsvar',
      'flutningsræða': 'Flutningsræða',
      'um fundarstjórn': 'Um fundarstjórn',
      'um atkvæðagreiðslu': 'Um atkvæðagreiðslu',
      'um dagskrá': 'Um dagskrá'
    };
    return typeMap[type] || type;
  };

  // Helper function to get sentiment icon
  const getSentimentIcon = (score) => {
    if (!score && score !== 0) return null;
    
    if (score > 0.3) {
      return <SentimentSatisfiedAltIcon color="success" />;
    } else if (score < -0.3) {
      return <SentimentVeryDissatisfiedIcon color="error" />;
    } else {
      return <SentimentNeutralIcon color="warning" />;
    }
  };

  // Helper function to group speeches by date
  const groupSpeechesByDate = (speeches) => {
    const grouped = {};
    
    speeches.forEach(speech => {
      const date = speech.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(speech);
    });
    
    // Sort dates in descending order (newest first)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        speeches: grouped[date]
      }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!mp) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No MP data found.</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* MP Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={mp.image_url}
                  alt={`${mp.first_name} ${mp.last_name}`}
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    mb: 2,
                    bgcolor: 'grey.200'
                  }}
                  imgProps={{
                    onError: (e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg style="width: 100px; height: 100px; color: #bdbdbd;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                      e.target.parentElement.appendChild(icon);
                    }
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  {`${mp.first_name} ${mp.last_name}`}
                </Typography>
                <Chip
                  label={mp.party ? mp.party.name : "Óháður þingmaður"}
                  sx={{
                    bgcolor: mp.party?.color || 'grey.500',
                    color: 'white',
                    mb: 1
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  {mp.constituency}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Contact Information */}
              <List>
                {mp.email && (
                  <ListItem>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Link href={`mailto:${mp.email}`}>{mp.email}</Link>
                  </ListItem>
                )}
                {mp.website && (
                  <ListItem>
                    <WebIcon sx={{ mr: 1 }} />
                    <Link href={mp.website} target="_blank" rel="noopener">
                      Vefsíða
                    </Link>
                  </ListItem>
                )}
                <ListItem>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {mp.twitter_url && (
                      <Link href={mp.twitter_url} target="_blank" rel="noopener">
                        <TwitterIcon />
                      </Link>
                    )}
                    {mp.facebook_url && (
                      <Link href={mp.facebook_url} target="_blank" rel="noopener">
                        <FacebookIcon />
                      </Link>
                    )}
                  </Box>
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Statistics */}
              <Typography variant="h6" gutterBottom>
                Tölfræði
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Flutt þingmál"
                    secondary={mp.bills_sponsored}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Meðflutt þingmál"
                    secondary={mp.bills_cosponsored}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RecordVoiceOverIcon sx={{ mr: 1, fontSize: '1rem' }} />
                        Ræður
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {mp.speech_count} ræður
                        </Typography>
                        {mp.total_speaking_time && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Heildartími: {formatDuration(mp.total_speaking_time)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {mp.first_elected && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon sx={{ mr: 1, fontSize: '1rem' }} />
                          Fyrst kjörin(n)
                        </Box>
                      }
                      secondary={new Date(mp.first_elected).toLocaleDateString('is-IS')}
                    />
                  </ListItem>
                )}
                {mp.current_position_started && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon sx={{ mr: 1, fontSize: '1rem' }} />
                          Núverandi seta hófst
                        </Box>
                      }
                      secondary={new Date(mp.current_position_started).toLocaleDateString('is-IS')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tabs Section */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab icon={<DescriptionIcon />} label="Persónulegar upplýsingar" />
              <Tab icon={<RecordVoiceOverIcon />} label="Ræður" />
              <Tab icon={<DescriptionIcon />} label="Þingmál" />
              <Tab icon={<HowToVoteIcon />} label="Atkvæðaskrá" />
              <Tab icon={<BusinessIcon />} label="Hagsmunaskráning" />
            </Tabs>
            
            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {/* Bio Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                  </Typography>
                  {mp.bio ? (
                    <Box>
                      {(() => {
                        const sections = {};
                        const bio = mp.bio;
                        
                        // Helper function to find the best split point
                        const findSplitPoint = (text, markers) => {
                          const positions = markers
                            .map(marker => ({ pos: text.indexOf(marker), marker }))
                            .filter(x => x.pos !== -1);
                          return positions.length > 0 ? 
                            Math.min(...positions.map(x => x.pos)) : -1;
                        };

                        // Extract personal information (always present)
                        sections.personal = {
                          title: "Persónulegar upplýsingar um þingmann",
                          content: ""
                        };

                        // Find education markers
                        const educationMarkers = [
                          'Grunnskólapróf', 
                          'Stúdentspróf',
                          'BSc.',
                          'Cand.',
                          'PhD',
                          'Próf',
                          'Nám'
                        ];
                        
                        const careerMarkers = [
                          'Kennari',
                          'Starfsmaður',
                          'Framkvæmdastjóri',
                          'Forstjóri',
                          'Ráðgjafi',
                          'Sérfræðingur',
                          'Starfaði',
                          'Vann',
                          'Yfirmaður',
                          'Stjórnandi'
                        ];

                        const publicServiceMarkers = [
                          'Alþingismaður',
                          'Í stjórn',
                          'Formaður',
                          'Nefndarmaður',
                          'Bæjarfulltrúi',
                          'Í nefnd',
                          'Í ráði',
                          'Sveitarstjórn'
                        ];

                        // Find split points
                        const educationStart = findSplitPoint(bio, educationMarkers);
                        const careerStart = findSplitPoint(bio, careerMarkers);
                        const publicServiceStart = findSplitPoint(bio, publicServiceMarkers);

                        // Set section contents based on found split points
                        if (educationStart !== -1) {
                          sections.personal.content = bio.substring(0, educationStart).trim();
                          
                          const nextStart = Math.min(
                            ...[careerStart, publicServiceStart]
                              .filter(x => x !== -1)
                          );
                          
                          if (nextStart !== Infinity) {
                            sections.education = {
                              title: "Menntun",
                              content: bio.substring(educationStart, nextStart).trim()
                            };
                          } else {
                            sections.education = {
                              title: "Menntun",
                              content: bio.substring(educationStart).trim()
                            };
                          }
                        } else {
                          // If no education section found, personal info goes up to career or public service
                          const firstSplit = Math.min(
                            ...[careerStart, publicServiceStart]
                              .filter(x => x !== -1)
                          );
                          sections.personal.content = bio.substring(0, firstSplit !== Infinity ? firstSplit : undefined).trim();
                        }

                        // Add career section if found
                        if (careerStart !== -1) {
                          sections.career = {
                            title: "Starfsferill",
                            content: bio.substring(
                              careerStart,
                              publicServiceStart !== -1 ? publicServiceStart : undefined
                            ).trim()
                          };
                        }

                        // Add public service section if found
                        if (publicServiceStart !== -1) {
                          sections.publicService = {
                            title: "Opinber störf",
                            content: bio.substring(publicServiceStart).trim()
                          };
                        }

                        // If no sections were identified, put everything in personal
                        if (Object.keys(sections).length === 1 && !sections.personal.content) {
                          sections.personal.content = bio;
                        }

                        return Object.entries(sections)
                          .filter(([_, section]) => section.content) // Only show sections with content
                          .map(([key, section], index, array) => (
                            <Box key={key} sx={{ mb: 3 }}>
                              <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: '1.1rem' }}>
                                {section.title}
                              </Typography>
                              <Typography paragraph sx={{ 
                                whiteSpace: 'pre-wrap',
                                '& span': { display: 'block', mb: 1 }
                              }}>
                                {section.content
                                  // Remove HTML tags and replace with newlines
                                  .replace(/<br\s*\/?>/gi, '\n')
                                  // First, protect periods in dates, abbreviations, and initials
                                  .replace(/(\d+)\.(\d+|[a-zA-ZáéíóúýþæöÁÉÍÓÚÝÞÆÖ]+)/g, '$1•$2')
                                  .replace(/([A-ZÁÉÍÓÚÝÞÆÖ])\.(\s*[A-ZÁÉÍÓÚÝÞÆÖ])/g, '$1•$2')
                                  // Split only on actual sentence endings (period followed by space and capital letter)
                                  // but not when the previous word is a single letter (initial)
                                  .split(/(?<!^[A-ZÁÉÍÓÚÝÞÆÖ])(?<=\.)(?=\s+[A-ZÁÉÍÓÚÝÞÆÖ])/)
                                  .map((sentence, i) => (
                                    <span key={i}>
                                      {sentence
                                        // Restore the protected periods
                                        .replace(/•/g, '.')
                                        .trim() + (sentence.trim().endsWith('.') ? '' : '.')}
                                    </span>
                                  ))}
                              </Typography>
                              {index < array.length - 1 && (
                                <Divider sx={{ my: 2 }} />
                              )}
                            </Box>
                        ));
                      })()}
                    </Box>
                  ) : (
                    <Typography paragraph>
                      Engar persónulegar upplýsingar eru til staðar.
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Speeches Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Ræður á Alþingi
                  </Typography>
                  
                  {speechesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : speeches.length > 0 ? (
                    <Box>
                      {groupSpeechesByDate(speeches).map(group => (
                        <Box key={group.date} sx={{ mb: 4 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'primary.light', 
                            color: 'white', 
                            p: 1, 
                            borderRadius: '4px 4px 0 0' 
                          }}>
                            <TodayIcon sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              {new Date(group.date).toLocaleDateString('is-IS', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Badge 
                              badgeContent={group.speeches.length} 
                              color="error" 
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          
                          {group.speeches.map((speech, index) => (
                            <Card 
                              key={speech.id} 
                              sx={{ 
                                mb: 2, 
                                borderTop: 0,
                                borderTopLeftRadius: index === 0 ? 0 : undefined,
                                borderTopRightRadius: index === 0 ? 0 : undefined
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Box>
                                    <Typography variant="h6" component="div">
                                      {speech.title || (speech.bill ? speech.bill.title : 'Untitled Speech')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Chip 
                                        icon={<MicIcon />} 
                                        label={formatSpeechType(speech.speech_type)} 
                                        size="small" 
                                        color="primary"
                                        sx={{ mr: 1 }}
                                      />
                                      {speech.bill && (
                                        <Chip
                                          icon={<ArticleIcon />}
                                          label={`Bill #${speech.althingi_bill_id || speech.bill.id}`}
                                          size="small"
                                          component={RouterLink}
                                          to={`/parliament/bills/${speech.bill.id}`}
                                          clickable
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {speech.start_time && (
                                      <Typography variant="body2" color="text.secondary">
                                        {new Date(speech.start_time).toLocaleTimeString(undefined, {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Typography>
                                    )}
                                    {speech.duration && (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {formatDuration(speech.duration)}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                                
                                {/* Media links */}
                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                  {speech.audio_url && (
                                    <Tooltip title="Listen to audio">
                                      <IconButton 
                                        color="primary" 
                                        size="small"
                                        component="a" 
                                        href={speech.audio_url} 
                                        target="_blank"
                                      >
                                        <VolumeUpIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {speech.video_url && (
                                    <Tooltip title="Watch video">
                                      <IconButton 
                                        color="primary" 
                                        size="small"
                                        component="a" 
                                        href={speech.video_url} 
                                        target="_blank"
                                      >
                                        <OndemandVideoIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {speech.html_url && (
                                    <Tooltip title="View transcript">
                                      <IconButton 
                                        color="primary" 
                                        size="small"
                                        component="a" 
                                        href={speech.html_url} 
                                        target="_blank"
                                      >
                                        <DescriptionIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {speech.sentiment_score !== null && (
                                    <Tooltip title={`Sentiment score: ${speech.sentiment_score.toFixed(2)}`}>
                                      <Box>
                                        {getSentimentIcon(speech.sentiment_score)}
                                      </Box>
                                    </Tooltip>
                                  )}
                                </Stack>
                                
                                {speech.text && (
                                  <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {speech.text.length > 200 
                                        ? `${speech.text.substring(0, 200)}...` 
                                        : speech.text}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Alert severity="info">Engar ræður fundust hjá þingmanni.</Alert>
                  )}
                </Box>
              )}
              
              {/* Bills Tab */}
              {activeTab === 2 && (
                <Box>
                  {billsLoading ? (
                    <CircularProgress />
                  ) : bills.length > 0 ? (
                    <List>
                      {bills.map((bill) => (
                        <ListItem key={bill.id}>
                          <ListItemText
                            primary={
                              <Link component={RouterLink} to={`/parliament/bills/${bill.id}`}>
                                {bill.title}
                              </Link>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(bill.introduced_date).toLocaleDateString()}
                                </Typography>
                                {' - '}
                                <Chip
                                  size="small"
                                  label={formatStatus(bill.status)}
                                  color={getStatusColor(bill.status)}
                                />
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>Engin þingmál fundust.</Typography>
                  )}
                </Box>
              )}
              
              {/* Voting Record Tab */}
              {activeTab === 3 && (
                <Box>
                  {votingLoading ? (
                    <CircularProgress />
                  ) : votingRecord.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Þingmál</TableCell>
                            <TableCell>Atkvæði</TableCell>
                            <TableCell>Dagsetning</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {votingRecord.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <Link component={RouterLink} to={`/parliament/bills/${record.bill.id}`}>
                                  {record.bill.title}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={formatVote(record.vote)}
                                  color={getVoteColor(record.vote)}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(record.vote_date).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>Engin atkvæðaskrá fannst.</Typography>
                  )}
                </Box>
              )}
              
              {/* Personal Interests Tab */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Hagsmunaskráning
                  </Typography>
                  
                  {interestsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : interests ? (
                    <Box>
                      {interests.board_positions && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Stjórnarseta
                          </Typography>
                          <Typography paragraph>{interests.board_positions}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.paid_work && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Launuð störf
                          </Typography>
                          <Typography paragraph>{interests.paid_work}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.business_activities && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Atvinnurekstur
                          </Typography>
                          <Typography paragraph>{interests.business_activities}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.company_ownership && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Eignarhlutir í fyrirtækjum
                          </Typography>
                          <Typography paragraph>{interests.company_ownership}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.financial_support && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Fjárhagslegur stuðningur
                          </Typography>
                          <Typography paragraph>{interests.financial_support}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.gifts && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Gjafir
                          </Typography>
                          <Typography paragraph>{interests.gifts}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.trips && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Ferðir og heimsóknir
                          </Typography>
                          <Typography paragraph>{interests.trips}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.debt_forgiveness && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Eftirgjöf skulda
                          </Typography>
                          <Typography paragraph>{interests.debt_forgiveness}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.real_estate && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Fasteignir
                          </Typography>
                          <Typography paragraph>{interests.real_estate}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.former_employer_agreements && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Samkomulag við fyrrverandi vinnuveitendur
                          </Typography>
                          <Typography paragraph>{interests.former_employer_agreements}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.future_employer_agreements && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Samkomulag um framtíðarstörf
                          </Typography>
                          <Typography paragraph>{interests.future_employer_agreements}</Typography>
                          <Divider />
                        </Box>
                      )}
                      
                      {interests.other_positions && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            Önnur trúnaðarstörf
                          </Typography>
                          <Typography paragraph>{interests.other_positions}</Typography>
                        </Box>
                      )}
                      
                      {interests.source_url && (
                        <Box sx={{ mt: 4 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            href={interests.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DescriptionIcon />}
                          >
                            Skoða frumskjal
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Engin hagsmunaskráning fannst.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemberDetailPage; 
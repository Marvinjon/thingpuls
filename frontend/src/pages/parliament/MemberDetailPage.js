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
  TableRow
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
import { parliamentService } from '../../services/api';

const MemberDetailPage = () => {
  const { id } = useParams(); // MP slug from URL
  const [mp, setMp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Tab content data
  const [speeches, setSpeeches] = useState([]);
  const [bills, setBills] = useState([]);
  const [votingRecord, setVotingRecord] = useState([]);
  const [speechesLoading, setSpeechesLoading] = useState(false);
  const [billsLoading, setBillsLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  
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
        
        // Mock data for development
        setMp({
          id: 1,
          first_name: 'Katrín',
          last_name: 'Jakobsdóttir',
          slug: 'katrin-jakobsdottir',
          althingi_id: 557,
          party: {
            id: 3,
            name: 'Left-Green Movement',
            abbreviation: 'V',
            color: '#1B5E20',
            description: 'Left-wing political party in Iceland'
          },
          constituency: 'Reykjavík North',
          email: 'katrin@althingi.is',
          website: 'https://www.althingi.is/katrin',
          bio: 'Katrín Jakobsdóttir has been serving as the prime minister of Iceland since 2017. She has been a member of the Althing (Iceland\'s parliament) for the Reykjavík North constituency since 2007. She is the chairperson of the Left-Green Movement.',
          birthdate: '1976-02-01',
          gender: 'F',
          social_media_links: {
            twitter: 'https://twitter.com/katrinjak',
            facebook: 'https://www.facebook.com/katrinjakobsdottirsida'
          },
          active: true,
          first_elected: '2007-05-12',
          current_position_started: '2017-11-30',
          speech_count: 247,
          bills_sponsored: 34,
          bills_cosponsored: 56
        });
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
  
  // Format the status for display
  const formatStatus = (status) => {
    const statusMap = {
      'introduced': 'Introduced',
      'in_committee': 'In Committee',
      'in_debate': 'In Debate',
      'amended': 'Amended',
      'passed': 'Passed',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    return statusMap[status] || status;
  };
  
  // Format the vote type for display
  const formatVote = (vote) => {
    const voteMap = {
      'yes': 'Yes',
      'no': 'No',
      'abstain': 'Abstain',
      'absent': 'Absent'
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
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !mp) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 3 }}>
          {error || 'MP not found'}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/parliament/members" 
          variant="contained"
        >
          Back to Members
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {/* MP Header */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={mp.photo}
              alt={`${mp.first_name} ${mp.last_name}`}
              sx={{
                width: 200,
                height: 200,
                mb: 2,
                border: '5px solid',
                borderColor: mp.party.color || 'primary.main'
              }}
            />
            <Chip 
              label={mp.party.name} 
              sx={{ 
                bgcolor: mp.party.color || 'primary.main',
                color: 'white',
                mb: 1
              }} 
            />
            {mp.active && (
              <Chip 
                label="Active MP" 
                color="success" 
                sx={{ mb: 1 }} 
              />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Typography variant="h4" component="h1" gutterBottom>
            {mp.first_name} {mp.last_name}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {mp.constituency}
          </Typography>
          
          {mp.bio && (
            <Typography variant="body1" paragraph>
              {mp.bio}
            </Typography>
          )}
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {mp.email && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon color="action" sx={{ mr: 1 }} />
                  <Link href={`mailto:${mp.email}`} color="inherit">
                    {mp.email}
                  </Link>
                </Box>
              </Grid>
            )}
            
            {mp.website && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WebIcon color="action" sx={{ mr: 1 }} />
                  <Link href={mp.website} target="_blank" rel="noopener noreferrer" color="inherit">
                    Website
                  </Link>
                </Box>
              </Grid>
            )}
            
            {mp.birthdate && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Born: {new Date(mp.birthdate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {mp.social_media_links && mp.social_media_links.twitter && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TwitterIcon color="action" sx={{ mr: 1 }} />
                  <Link href={mp.social_media_links.twitter} target="_blank" rel="noopener noreferrer" color="inherit">
                    Twitter
                  </Link>
                </Box>
              </Grid>
            )}
            
            {mp.social_media_links && mp.social_media_links.facebook && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FacebookIcon color="action" sx={{ mr: 1 }} />
                  <Link href={mp.social_media_links.facebook} target="_blank" rel="noopener noreferrer" color="inherit">
                    Facebook
                  </Link>
                </Box>
              </Grid>
            )}
            
            {mp.social_media_links && mp.social_media_links.instagram && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InstagramIcon color="action" sx={{ mr: 1 }} />
                  <Link href={mp.social_media_links.instagram} target="_blank" rel="noopener noreferrer" color="inherit">
                    Instagram
                  </Link>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      {/* MP Activity Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RecordVoiceOverIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{mp.speech_count}</Typography>
              <Typography variant="body2" color="text.secondary">Speeches</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{mp.bills_sponsored}</Typography>
              <Typography variant="body2" color="text.secondary">Bills Sponsored</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{mp.bills_cosponsored}</Typography>
              <Typography variant="body2" color="text.secondary">Bills Co-sponsored</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">
                {mp.first_elected ? new Date(mp.first_elected).getFullYear() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">First Elected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for MP Activity */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="MP activity tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<RecordVoiceOverIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<RecordVoiceOverIcon />} iconPosition="start" label="Speeches" />
            <Tab icon={<DescriptionIcon />} iconPosition="start" label="Bills" />
            <Tab icon={<HowToVoteIcon />} iconPosition="start" label="Voting Record" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Parliamentary Overview
            </Typography>
            <Typography variant="body1" paragraph>
              {mp.first_name} {mp.last_name} is a member of the {mp.party.name} ({mp.party.abbreviation}) 
              representing the {mp.constituency} constituency. 
              {mp.first_elected && ` First elected to parliament in ${new Date(mp.first_elected).getFullYear()}.`}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Party Information" />
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      <strong>Party:</strong> {mp.party.name} ({mp.party.abbreviation})
                    </Typography>
                    {mp.party.description && (
                      <Typography variant="body2" color="text.secondary">
                        {mp.party.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Parliamentary Service" />
                  <CardContent>
                    {mp.first_elected && (
                      <Typography variant="body2" gutterBottom>
                        <strong>First Elected:</strong> {new Date(mp.first_elected).toLocaleDateString()}
                      </Typography>
                    )}
                    {mp.current_position_started && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Current Position Since:</strong> {new Date(mp.current_position_started).toLocaleDateString()}
                      </Typography>
                    )}
                    {mp.end_of_service && (
                      <Typography variant="body2" gutterBottom>
                        <strong>End of Service:</strong> {new Date(mp.end_of_service).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" paragraph>
                Select a tab above to view detailed information about speeches, bills, and voting record.
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Speeches Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Speeches
            </Typography>
            
            {speechesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : speeches.length > 0 ? (
              <List>
                {speeches.map((speech) => (
                  <Paper key={speech.id} elevation={2} sx={{ mb: 2 }}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="div">
                            {speech.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Date: {new Date(speech.date).toLocaleDateString()}
                            </Typography>
                            {speech.bill && (
                              <Typography variant="body2" color="text.secondary">
                                Related Bill: {speech.bill.title}
                              </Typography>
                            )}
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                size="small" 
                                label={`Duration: ${Math.floor(speech.duration / 60)}m ${speech.duration % 60}s`} 
                                color="primary" 
                                variant="outlined"
                                sx={{ mr: 1 }} 
                              />
                              {speech.sentiment_score !== null && (
                                <Chip 
                                  size="small" 
                                  label={`Sentiment: ${(speech.sentiment_score > 0.5) ? 'Positive' : (speech.sentiment_score < 0.4) ? 'Negative' : 'Neutral'}`} 
                                  color={(speech.sentiment_score > 0.5) ? 'success' : (speech.sentiment_score < 0.4) ? 'error' : 'default'} 
                                  variant="outlined" 
                                />
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                No speeches found for this MP.
              </Typography>
            )}
          </Box>
        )}
        
        {/* Bills Tab */}
        {activeTab === 2 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sponsored Bills
            </Typography>
            
            {billsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : bills.length > 0 ? (
              <TableContainer component={Paper}>
                <Table aria-label="bills table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Introduced</TableCell>
                      <TableCell>Co-sponsors</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell component="th" scope="row">
                          {bill.title}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={formatStatus(bill.status)} 
                            color={getStatusColor(bill.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(bill.introduced_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {bill.sponsors_count - 1}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            component={RouterLink} 
                            to={`/parliament/bills/${bill.id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                No bills sponsored by this MP.
              </Typography>
            )}
          </Box>
        )}
        
        {/* Voting Record Tab */}
        {activeTab === 3 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voting Record
            </Typography>
            
            {votingLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : votingRecord.length > 0 ? (
              <TableContainer component={Paper}>
                <Table aria-label="voting record table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Vote</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {votingRecord.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell component="th" scope="row">
                          {record.bill.title}
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
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            component={RouterLink} 
                            to={`/parliament/bills/${record.bill.id}`}
                          >
                            View Bill
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                No voting record found for this MP.
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      <Box sx={{ mt: 4, mb: 6 }}>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/parliament/members"
        >
          Back to Members
        </Button>
      </Box>
    </Container>
  );
};

export default MemberDetailPage; 
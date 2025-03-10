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
                  src={mp.photo}
                  alt={mp.full_name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {mp.full_name}
                </Typography>
                <Chip
                  label={mp.party ? mp.party.name : "Unknown Party"}
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
                      Personal Website
                    </Link>
                  </ListItem>
                )}
                {mp.social_media_links && (
                  <ListItem>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {mp.social_media_links.twitter && (
                        <Link href={mp.social_media_links.twitter} target="_blank" rel="noopener">
                          <TwitterIcon />
                        </Link>
                      )}
                      {mp.social_media_links.facebook && (
                        <Link href={mp.social_media_links.facebook} target="_blank" rel="noopener">
                          <FacebookIcon />
                        </Link>
                      )}
                      {mp.social_media_links.instagram && (
                        <Link href={mp.social_media_links.instagram} target="_blank" rel="noopener">
                          <InstagramIcon />
                        </Link>
                      )}
                    </Box>
                  </ListItem>
                )}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Statistics */}
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Bills Sponsored"
                    secondary={mp.bills_sponsored}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Bills Co-sponsored"
                    secondary={mp.bills_cosponsored}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Speeches Given"
                    secondary={mp.speech_count}
                  />
                </ListItem>
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
              variant="fullWidth"
            >
              <Tab icon={<DescriptionIcon />} label="Bio" />
              <Tab icon={<RecordVoiceOverIcon />} label="Speeches" />
              <Tab icon={<DescriptionIcon />} label="Bills" />
              <Tab icon={<HowToVoteIcon />} label="Voting Record" />
            </Tabs>
            
            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {/* Bio Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Biography
                  </Typography>
                  <Typography paragraph>
                    {mp.bio || 'No biography available.'}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Service Information
                  </Typography>
                  <List>
                    {mp.first_elected && (
                      <ListItem>
                        <EventIcon sx={{ mr: 1 }} />
                        <ListItemText
                          primary="First Elected"
                          secondary={new Date(mp.first_elected).toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                    {mp.current_position_started && (
                      <ListItem>
                        <EventIcon sx={{ mr: 1 }} />
                        <ListItemText
                          primary="Current Position Started"
                          secondary={new Date(mp.current_position_started).toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
              
              {/* Speeches Tab */}
              {activeTab === 1 && (
                <Box>
                  {speechesLoading ? (
                    <CircularProgress />
                  ) : speeches.length > 0 ? (
                    <List>
                      {speeches.map((speech) => (
                        <ListItem key={speech.id}>
                          <ListItemText
                            primary={speech.title}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(speech.date).toLocaleDateString()}
                                </Typography>
                                {speech.bill && (
                                  <Typography component="span" variant="body2">
                                    {' - '}
                                    <Link component={RouterLink} to={`/parliament/bills/${speech.bill.id}`}>
                                      {speech.bill.title}
                                    </Link>
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No speeches found.</Typography>
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
                    <Typography>No bills found.</Typography>
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
                            <TableCell>Bill</TableCell>
                            <TableCell>Vote</TableCell>
                            <TableCell>Date</TableCell>
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
                    <Typography>No voting record found.</Typography>
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
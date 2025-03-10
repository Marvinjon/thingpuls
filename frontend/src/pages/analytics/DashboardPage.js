import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent, 
  CardHeader, Tabs, Tab, Divider, Button, CircularProgress, 
  Alert, List, ListItem, ListItemText, Chip, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Menu, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Mock data for charts (in real application this would be actual data)
// In a real app, these would be actual chart components using a library like Recharts, Victory, or Chart.js

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeframe, setTimeframe] = useState('past-month');
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        // const response = await api.get('/analytics/dashboard', { params: { timeframe } });
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const mockData = {
          // Parliamentary Activity
          parliamentaryActivity: {
            totalSessionDays: 87,
            totalBills: 42,
            passedBills: 24,
            rejectedBills: 8,
            inProgressBills: 10,
            totalVotes: 156,
            attendanceRate: 91.4,
            sessionMinutes: 18560,
            topicDistribution: [
              { name: 'Economy', value: 28 },
              { name: 'Healthcare', value: 22 },
              { name: 'Environment', value: 18 },
              { name: 'Education', value: 12 },
              { name: 'Foreign Policy', value: 10 },
              { name: 'Other', value: 10 }
            ]
          },
          
          // MP Performance
          mpPerformance: {
            topAttendance: [
              { id: 1, name: 'Anna Jónsdóttir', party: 'Left-Green Movement', attendance: 100 },
              { id: 2, name: 'Bjarni Benediktsson', party: 'Independence Party', attendance: 98.5 },
              { id: 3, name: 'Katrín Jakobsdóttir', party: 'Left-Green Movement', attendance: 97.8 }
            ],
            lowestAttendance: [
              { id: 8, name: 'Björn Leví Gunnarsson', party: 'Pirate Party', attendance: 78.2 },
              { id: 9, name: 'Bergþór Ólason', party: 'Centre Party', attendance: 82.5 },
              { id: 10, name: 'Helgi Hrafn Gunnarsson', party: 'Pirate Party', attendance: 84.1 }
            ],
            mostSpeakingTime: [
              { id: 2, name: 'Bjarni Benediktsson', party: 'Independence Party', minutes: 840 },
              { id: 3, name: 'Katrín Jakobsdóttir', party: 'Left-Green Movement', minutes: 780 },
              { id: 5, name: 'Logi Einarsson', party: 'Social Democratic Alliance', minutes: 720 }
            ],
            mostBillsSponsored: [
              { id: 2, name: 'Bjarni Benediktsson', party: 'Independence Party', count: 12 },
              { id: 11, name: 'Þorgerður Katrín Gunnarsdóttir', party: 'Reform', count: 8 },
              { id: 3, name: 'Katrín Jakobsdóttir', party: 'Left-Green Movement', count: 7 }
            ]
          },
          
          // Voting Analysis
          votingAnalysis: {
            partyUnity: [
              { party: 'Independence Party', unity: 92.5 },
              { party: 'Left-Green Movement', unity: 89.3 },
              { party: 'Progressive Party', unity: 94.1 },
              { party: 'Social Democratic Alliance', unity: 87.8 },
              { party: 'Centre Party', unity: 95.6 },
              { party: 'Pirate Party', unity: 76.2 },
              { party: 'Reform', unity: 85.5 },
              { party: 'People\'s Party', unity: 91.7 }
            ],
            crossPartyAgreement: [
              { pair: 'Left-Green Movement / Social Democratic Alliance', rate: 68.4 },
              { pair: 'Independence Party / Progressive Party', rate: 72.1 },
              { pair: 'Independence Party / Reform', rate: 65.9 },
              { pair: 'Pirate Party / Social Democratic Alliance', rate: 63.2 },
              { pair: 'Centre Party / People\'s Party', rate: 57.8 }
            ],
            controversialVotes: [
              { 
                id: 1, 
                title: 'Climate Action Bill Amendment', 
                date: '2023-06-15', 
                result: 'Passed',
                votes: { for: 33, against: 30, abstentions: 0, absent: 0 }
              },
              { 
                id: 2, 
                title: 'Healthcare Funding Increase', 
                date: '2023-05-22', 
                result: 'Failed',
                votes: { for: 31, against: 32, abstentions: 0, absent: 0 }
              },
              { 
                id: 3, 
                title: 'Foreign Investment Regulations', 
                date: '2023-07-08', 
                result: 'Passed',
                votes: { for: 32, against: 29, abstentions: 2, absent: 0 }
              }
            ]
          },
          
          // Upcoming Events
          upcomingEvents: [
            { 
              id: 1, 
              title: 'Budget Committee Meeting', 
              date: '2023-10-05T10:00:00Z', 
              type: 'committee', 
              location: 'Committee Room A'
            },
            { 
              id: 2, 
              title: 'First Reading: Renewable Energy Bill', 
              date: '2023-10-07T13:00:00Z', 
              type: 'session', 
              location: 'Main Chamber'
            },
            { 
              id: 3, 
              title: 'Public Hearing: Education Reform', 
              date: '2023-10-10T14:30:00Z', 
              type: 'hearing', 
              location: 'Committee Room B'
            },
            { 
              id: 4, 
              title: 'Vote: Electoral Reform Amendment', 
              date: '2023-10-12T11:00:00Z', 
              type: 'vote', 
              location: 'Main Chamber'
            },
            { 
              id: 5, 
              title: 'Parliamentary Recess Begins', 
              date: '2023-12-15T00:00:00Z', 
              type: 'recess', 
              location: 'N/A'
            }
          ]
        };
        
        setDashboardData(mockData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'committee':
        return 'primary';
      case 'session':
        return 'secondary';
      case 'hearing':
        return 'info';
      case 'vote':
        return 'success';
      case 'recess':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parliamentary Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track parliamentary activities, performance metrics, and legislative analytics
        </Typography>
      </Box>
      
      {/* Dashboard Controls */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <DateRangeIcon sx={{ mr: 1 }} />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={timeframe}
              onChange={handleTimeframeChange}
              label="Timeframe"
            >
              <MenuItem value="past-week">Past Week</MenuItem>
              <MenuItem value="past-month">Past Month</MenuItem>
              <MenuItem value="past-quarter">Past Quarter</MenuItem>
              <MenuItem value="past-year">Past Year</MenuItem>
              <MenuItem value="current-session">Current Parliamentary Session</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterAltIcon />} 
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
          >
            Export Data
          </Button>
        </Box>
      </Box>
      
      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab icon={<AssessmentIcon />} label="Activity Summary" />
          <Tab icon={<GroupIcon />} label="MP Performance" />
          <Tab icon={<HowToVoteIcon />} label="Voting Analysis" />
          <Tab icon={<EventNoteIcon />} label="Upcoming Events" />
        </Tabs>
      </Box>
      
      {/* Activity Summary Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Key Metrics</Typography>
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="primary">
                      {dashboardData.parliamentaryActivity.totalSessionDays}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Session Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="primary">
                      {dashboardData.parliamentaryActivity.totalBills}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bills
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {dashboardData.parliamentaryActivity.passedBills}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Passed Bills
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="error.main">
                      {dashboardData.parliamentaryActivity.rejectedBills}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected Bills
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="info.main">
                      {dashboardData.parliamentaryActivity.inProgressBills}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="secondary.main">
                      {dashboardData.parliamentaryActivity.totalVotes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Votes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="primary">
                      {dashboardData.parliamentaryActivity.attendanceRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" sx={{ p: 1 }}>
                    <Typography variant="h4" color="text.primary">
                      {Math.round(dashboardData.parliamentaryActivity.sessionMinutes / 60)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Session Hours
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Topic Distribution */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Legislative Topics
              </Typography>
              
              {/* This would be a pie chart in a real app */}
              {/* For now, showing a text-based representation */}
              {dashboardData.parliamentaryActivity.topicDistribution.map((topic, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">{topic.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">{topic.value}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={topic.value} 
                    color={
                      index === 0 ? "primary" : 
                      index === 1 ? "secondary" : 
                      index === 2 ? "success" : 
                      index === 3 ? "info" : 
                      index === 4 ? "warning" : 
                      "error"
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
              
              <Box mt={2} textAlign="center">
                <Button 
                  component={Link}
                  to="/analytics/reports"
                  size="small"
                  endIcon={<EqualizerIcon />}
                >
                  View Detailed Breakdown
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Bill Progress */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Bill Activity
              </Typography>
              
              {/* This would be a timeline or chart in a real app */}
              {/* For now, just showing a text-based table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell align="right">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Climate Action Bill</TableCell>
                      <TableCell>
                        <Chip size="small" label="Passed" color="success" />
                      </TableCell>
                      <TableCell>Final Reading</TableCell>
                      <TableCell>15 Sep 2023</TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to="/parliament/bills/1" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Education Reform Package</TableCell>
                      <TableCell>
                        <Chip size="small" label="In Committee" color="info" />
                      </TableCell>
                      <TableCell>Committee Review</TableCell>
                      <TableCell>18 Sep 2023</TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to="/parliament/bills/2" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Healthcare Funding Bill</TableCell>
                      <TableCell>
                        <Chip size="small" label="Failed" color="error" />
                      </TableCell>
                      <TableCell>Second Reading</TableCell>
                      <TableCell>10 Sep 2023</TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to="/parliament/bills/3" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Foreign Investment Regulations</TableCell>
                      <TableCell>
                        <Chip size="small" label="Passed" color="success" />
                      </TableCell>
                      <TableCell>Final Reading</TableCell>
                      <TableCell>5 Sep 2023</TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to="/parliament/bills/4" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax Reform Bill</TableCell>
                      <TableCell>
                        <Chip size="small" label="In Debate" color="warning" />
                      </TableCell>
                      <TableCell>First Reading</TableCell>
                      <TableCell>20 Sep 2023</TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to="/parliament/bills/5" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={2} textAlign="center">
                <Button 
                  component={Link}
                  to="/parliament/bills"
                  variant="outlined"
                >
                  View All Bills
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* MP Performance Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Attendance Leaders" 
                subheader="MPs with the highest attendance rates"
                action={
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <List>
                  {dashboardData.mpPerformance.topAttendance.map((mp, index) => (
                    <ListItem 
                      key={index}
                      component={Link}
                      to={`/parliament/members/${mp.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography>
                              {index + 1}. {mp.name}
                            </Typography>
                            <Typography fontWeight="bold" color="primary">
                              {mp.attendance}%
                            </Typography>
                          </Box>
                        } 
                        secondary={mp.party}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Attendance Concerns" 
                subheader="MPs with the lowest attendance rates"
                action={
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <List>
                  {dashboardData.mpPerformance.lowestAttendance.map((mp, index) => (
                    <ListItem 
                      key={index}
                      component={Link}
                      to={`/parliament/members/${mp.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography>
                              {index + 1}. {mp.name}
                            </Typography>
                            <Typography fontWeight="bold" color="error">
                              {mp.attendance}%
                            </Typography>
                          </Box>
                        } 
                        secondary={mp.party}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Most Speaking Time" 
                subheader="MPs with the most minutes speaking in parliament"
                action={
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <List>
                  {dashboardData.mpPerformance.mostSpeakingTime.map((mp, index) => (
                    <ListItem 
                      key={index}
                      component={Link}
                      to={`/parliament/members/${mp.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography>
                              {index + 1}. {mp.name}
                            </Typography>
                            <Typography fontWeight="bold" color="info.main">
                              {mp.minutes} min
                            </Typography>
                          </Box>
                        } 
                        secondary={mp.party}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Most Bills Sponsored" 
                subheader="MPs who have sponsored the most legislation"
                action={
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <List>
                  {dashboardData.mpPerformance.mostBillsSponsored.map((mp, index) => (
                    <ListItem 
                      key={index}
                      component={Link}
                      to={`/parliament/members/${mp.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography>
                              {index + 1}. {mp.name}
                            </Typography>
                            <Typography fontWeight="bold" color="secondary.main">
                              {mp.count} bills
                            </Typography>
                          </Box>
                        } 
                        secondary={mp.party}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                component={Link}
                to="/parliament/members"
                variant="contained"
              >
                View All MP Profiles
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
      
      {/* Voting Analysis Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Party Voting Unity
              </Typography>
              
              {/* This would be a bar chart in a real app */}
              {dashboardData.votingAnalysis.partyUnity.map((party, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">{party.party}</Typography>
                    <Typography variant="body2" fontWeight="bold">{party.unity}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={party.unity} 
                    color={
                      index % 6 === 0 ? "primary" : 
                      index % 6 === 1 ? "secondary" : 
                      index % 6 === 2 ? "success" : 
                      index % 6 === 3 ? "info" : 
                      index % 6 === 4 ? "warning" : 
                      "error"
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cross-Party Cooperation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Rate at which different parties vote together on legislation
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Party Pair</TableCell>
                      <TableCell align="right">Agreement Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.votingAnalysis.crossPartyAgreement.map((pair, index) => (
                      <TableRow key={index}>
                        <TableCell>{pair.pair}</TableCell>
                        <TableCell align="right">{pair.rate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Closest Votes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Most controversial bills with the narrowest margins
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell align="center">For</TableCell>
                      <TableCell align="center">Against</TableCell>
                      <TableCell align="center">Margin</TableCell>
                      <TableCell align="right">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.votingAnalysis.controversialVotes.map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell>{vote.title}</TableCell>
                        <TableCell>{vote.date}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={vote.result} 
                            color={vote.result === 'Passed' ? 'success' : 'error'} 
                          />
                        </TableCell>
                        <TableCell align="center">{vote.votes.for}</TableCell>
                        <TableCell align="center">{vote.votes.against}</TableCell>
                        <TableCell align="center">
                          {Math.abs(vote.votes.for - vote.votes.against)}
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            component={Link} 
                            to={`/parliament/voting-records?bill=${vote.id}`} 
                            size="small"
                            startIcon={<HowToVoteIcon />}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={2} textAlign="center">
                <Button 
                  component={Link}
                  to="/parliament/voting-records"
                  variant="outlined"
                >
                  View All Voting Records
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Upcoming Events Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Parliamentary Calendar
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Add to Calendar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.upcomingEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell>{formatTime(event.date)}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small"
                            label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            color={getEventTypeColor(event.type)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <CalendarTodayIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={3} textAlign="center">
                <Button 
                  variant="contained"
                  startIcon={<CalendarTodayIcon />}
                >
                  Subscribe to Calendar
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Refresh Data</MenuItem>
        <MenuItem onClick={handleMenuClose}>Download as PDF</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export to Excel</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share Dashboard</MenuItem>
      </Menu>
    </Container>
  );
};

export default DashboardPage; 
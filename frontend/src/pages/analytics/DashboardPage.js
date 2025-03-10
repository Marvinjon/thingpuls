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
import { analyticsService } from '../../services/api';

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
        const response = await analyticsService.getDashboardConfig();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
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

  if (!dashboardData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No dashboard data available.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={handleTimeframeChange}
              label="Timeframe"
            >
              <MenuItem value="past-week">Past Week</MenuItem>
              <MenuItem value="past-month">Past Month</MenuItem>
              <MenuItem value="past-year">Past Year</MenuItem>
              <MenuItem value="all-time">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Display actual data from dashboardData */}
        {dashboardData && (
          <>
            {/* Parliamentary Activity */}
            <Grid item xs={12}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Parliamentary Activity
                  </Typography>
                  <Grid container spacing={3}>
                    {dashboardData.parliamentaryActivity && (
                      <>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card>
                            <CardContent>
                              <Typography variant="h5">
                                {dashboardData.parliamentaryActivity.totalSessionDays}
                              </Typography>
                              <Typography color="text.secondary">
                                Session Days
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card>
                            <CardContent>
                              <Typography variant="h5">
                                {dashboardData.parliamentaryActivity.totalBills}
                              </Typography>
                              <Typography color="text.secondary">
                                Total Bills
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card>
                            <CardContent>
                              <Typography variant="h5">
                                {dashboardData.parliamentaryActivity.passedBills}
                              </Typography>
                              <Typography color="text.secondary">
                                Passed Bills
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Card>
                            <CardContent>
                              <Typography variant="h5">
                                {dashboardData.parliamentaryActivity.totalVotes}
                              </Typography>
                              <Typography color="text.secondary">
                                Total Votes
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* MP Performance */}
            <Grid item xs={12} md={6}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    MP Performance
                  </Typography>
                  {dashboardData.mpPerformance && (
                    <List>
                      {dashboardData.mpPerformance.topAttendance?.map((mp) => (
                        <ListItem key={mp.id}>
                          <ListItemText
                            primary={mp.name}
                            secondary={`Attendance: ${mp.attendance}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Voting Analysis */}
            <Grid item xs={12} md={6}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Voting Analysis
                  </Typography>
                  {dashboardData.votingAnalysis && (
                    <List>
                      {dashboardData.votingAnalysis.partyUnity?.map((party) => (
                        <ListItem key={party.party}>
                          <ListItemText
                            primary={party.party}
                            secondary={`Party Unity: ${party.unity}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Upcoming Events */}
            <Grid item xs={12}>
              <Paper>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events
                  </Typography>
                  {dashboardData.upcomingEvents && (
                    <List>
                      {dashboardData.upcomingEvents.map((event) => (
                        <ListItem key={event.id}>
                          <ListItemText
                            primary={event.title}
                            secondary={`${formatDate(event.date)} at ${formatTime(event.date)}`}
                          />
                          <Chip
                            label={event.type}
                            color={getEventTypeColor(event.type)}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPage; 
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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('past-month');
  const [dashboardData, setDashboardData] = useState(null);
  const [votingPatterns, setVotingPatterns] = useState(null);
  const [mpActivity, setMpActivity] = useState(null);
  const [topicTrends, setTopicTrends] = useState(null);

  // Color scheme for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data
        const response = await analyticsService.getDashboardConfig();
        const data = response.data;
        
        // Set all the data from the response
        setDashboardData({
          parliamentaryActivity: data.parliamentaryActivity,
          recentActivity: data.recentActivity
        });
        setVotingPatterns(data.votingPatterns);
        setMpActivity(data.mpActivity);
        setTopicTrends(data.topicTrends);
        
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Parliamentary Analytics Dashboard
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
        {/* Activity Overview Cards */}
        {dashboardData?.parliamentaryActivity && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bills
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.totalBills}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.parliamentaryActivity.passedBills / dashboardData.parliamentaryActivity.totalBills) * 100}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Passed Bills
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.passedBills}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {Math.round((dashboardData.parliamentaryActivity.passedBills / dashboardData.parliamentaryActivity.totalBills) * 100)}% success rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active MPs
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.activeMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Across {dashboardData.parliamentaryActivity.totalParties} parties
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Votes Cast
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.totalVotes}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    In current session
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Voting Patterns Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voting Patterns by Party
            </Typography>
            {votingPatterns && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(votingPatterns).map(([party, votes]) => ({
                    party,
                    yes: votes.yes,
                    no: votes.no,
                    abstain: votes.abstain
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="party" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" fill="#4caf50" stackId="a" />
                  <Bar dataKey="no" fill="#f44336" stackId="a" />
                  <Bar dataKey="abstain" fill="#ff9800" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* MP Activity Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top MP Activity
            </Typography>
            {mpActivity && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mpActivity.labels.map((name, index) => ({
                  name,
                  votes: mpActivity.vote_counts[index],
                  bills: mpActivity.bill_counts[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#8884d8" name="Votes Cast" />
                  <Bar dataKey="bills" fill="#82ca9d" name="Bills Sponsored" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Topic Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bill Topics Distribution
            </Typography>
            {topicTrends && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicTrends.labels.map((label, index) => ({
                      name: label,
                      value: topicTrends.bill_counts[index]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topicTrends.labels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Parliamentary Activity
            </Typography>
            {dashboardData?.recentActivity && (
              <List>
                {dashboardData.recentActivity.map((activity, index) => (
                  <ListItem key={index} divider={index < dashboardData.recentActivity.length - 1}>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textSecondary">
                            {new Date(activity.date).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Chip 
                            size="small" 
                            label={activity.type}
                            color={
                              activity.type === 'bill' ? 'primary' :
                              activity.type === 'vote' ? 'secondary' :
                              'default'
                            }
                            sx={{ mt: 1 }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage; 
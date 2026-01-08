import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent, 
  CardHeader, Tabs, Tab, Divider, Button, CircularProgress, 
  Alert, List, ListItem, ListItemText, Chip, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress
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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, parliamentService } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [votingPatterns, setVotingPatterns] = useState(null);
  const [billPipeline, setBillPipeline] = useState(null);
  const [partyCohesion, setPartyCohesion] = useState(null);
  const [efficiencyTimeline, setEfficiencyTimeline] = useState(null);
  const [topicTrends, setTopicTrends] = useState(null);
  const [topSpeakers, setTopSpeakers] = useState(null);
  const [topicsMap, setTopicsMap] = useState({}); // Map topic names to IDs

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
        setBillPipeline(data.billPipeline);
        setPartyCohesion(data.partyCohesion);
        setEfficiencyTimeline(data.efficiencyTimeline);
        setTopicTrends(data.topicTrends);
        
        // Fetch top speakers
        const speakersResponse = await analyticsService.getTopSpeakers({ limit: 10 });
        setTopSpeakers(speakersResponse.data);
        
        // Fetch topics to create name-to-ID mapping
        const topicsResponse = await parliamentService.getTopics();
        const topicsData = topicsResponse.data.results || topicsResponse.data || [];
        const nameToIdMap = {};
        topicsData.forEach(topic => {
          nameToIdMap[topic.name] = topic.id;
        });
        setTopicsMap(nameToIdMap);
        
        setError(null);
      } catch (err) {
        setError("Ekki tókst að hlaða gögnum. Vinsamlegast reyndu aftur síðar.");
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tölfræði þingsins
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gögn frá 157. þingi Alþingis
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Activity Overview Cards */}
        {dashboardData?.parliamentaryActivity && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Fjöldi þingmála
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
                    Samþykkt mál
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.passedBills}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {Math.round((dashboardData.parliamentaryActivity.passedBills / dashboardData.parliamentaryActivity.totalBills) * 100)}% samþykkishlutfall
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Virkir þingmenn
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.activeMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Í {dashboardData.parliamentaryActivity.totalParties} flokkum
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Meðalvinnsla mála
                  </Typography>
                  <Typography variant="h3">
                    {dashboardData.parliamentaryActivity.avgProcessingDays}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    dagar að meðaltali
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
              Atkvæðamynstur eftir flokkum
            </Typography>
            {votingPatterns && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(votingPatterns).map(([party, votes]) => ({
                    party,
                    yes: votes.yes,
                    no: votes.no,
                    abstain: votes.abstain,
                    absent: votes.absent
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
                  <Bar dataKey="yes" fill="#4caf50" stackId="a" name="Já" />
                  <Bar dataKey="no" fill="#f44336" stackId="a" name="Nei" />
                  <Bar dataKey="abstain" fill="#ff9800" stackId="a" name="Sitja hjá" />
                  <Bar dataKey="absent" fill="#9e9e9e" stackId="a" name="Fjarverandi" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Bill Progress Pipeline Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Staða þingmála
            </Typography>
            {billPipeline && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(billPipeline).map(([status, count]) => {
                    const statusTranslations = {
                      'introduced': 'Lagt fram',
                      'awaiting_first_reading': 'Bíða 1. umræðu',
                      'in_committee': 'Í nefnd',
                      'committee': 'Í nefnd',
                      'awaiting_second_reading': 'Bíða 2. umræðu',
                      'awaiting_third_reading': 'Bíða 3. umræðu',
                      'passed': 'Samþykkt',
                      'rejected': 'Hafnað',
                      'withdrawn': 'Dregið til baka',
                      'question_sent': 'Fyrirspurn send',
                      'question_answered': 'Fyrirspurn svarað'
                    };
                    return {
                      status: statusTranslations[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1),
                      count
                    };
                  })}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2196f3" name="Fjöldi mála" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Top Speakers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Þingmenn sem tala mest - Topp 10
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
              Þingmenn raðaðir eftir heildartíma ræðna
            </Typography>
            {topSpeakers && topSpeakers.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Þingmaður</TableCell>
                      <TableCell>Flokkur</TableCell>
                      <TableCell align="right">Fjöldi ræðna</TableCell>
                      <TableCell align="right">Heildartími (klukkustundir)</TableCell>
                      <TableCell align="right">Heildartími (mínútur)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topSpeakers.map((mp, index) => (
                      <TableRow 
                        key={mp.id}
                        component={Link}
                        to={`/parliament/members/${mp.slug}`}
                        sx={{
                          textDecoration: 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="h6" fontWeight={600}>
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                              component="img"
                              src={mp.image_url}
                              alt={mp.name}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <Typography variant="body1" fontWeight={500}>
                              {mp.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={mp.party}
                            size="small"
                            sx={{
                              bgcolor: mp.party_color + '20',
                              color: mp.party_color,
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {mp.speech_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight={600}>
                            {mp.speaking_time_hours}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="textSecondary">
                            {mp.speaking_time_minutes}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="textSecondary">Engin gögn tiltæk</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Party Cohesion Scores Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Samheldni flokka
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Hlutfall samstöðu innan flokka við atkvæðagreiðslur
            </Typography>
            {partyCohesion && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(partyCohesion).map(([party, score]) => ({
                    party,
                    score
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
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="score" fill="#9c27b0" name="Samheldni %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Legislative Efficiency Timeline Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Framleiðni þingsins
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Samþykkt mál yfir tíma
            </Typography>
            {efficiencyTimeline && efficiencyTimeline.labels && efficiencyTimeline.labels.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart 
                  data={efficiencyTimeline.labels.map((label, index) => ({
                    month: label,
                    bills: efficiencyTimeline.counts[index]
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorBills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="bills" 
                    stroke="#00bcd4" 
                    fillOpacity={1} 
                    fill="url(#colorBills)" 
                    name="Samþykkt mál"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {(!efficiencyTimeline || !efficiencyTimeline.labels || efficiencyTimeline.labels.length === 0) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="textSecondary">Engin gögn tiltæk</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Topic Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dreifing málaflokka
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2, fontStyle: 'italic' }}>
              Smelltu á málaflokk til að sjá tengd þingmál
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
                    onClick={(data) => {
                      const topicName = data.name;
                      const topicId = topicsMap[topicName];
                      if (topicId) {
                        navigate(`/parliament/bills?topic=${topicId}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {topicTrends.labels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    onClick={(data) => {
                      const topicName = data.value;
                      const topicId = topicsMap[topicName];
                      if (topicId) {
                        navigate(`/parliament/bills?topic=${topicId}`);
                      }
                    }}
                    wrapperStyle={{ cursor: 'pointer' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nýleg þingvinna
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
                            {new Date(activity.date).toLocaleDateString('is-IS')}
                          </Typography>
                          <br />
                          <Chip 
                            size="small" 
                            label={activity.type === 'bill' ? 'Þingmál' : activity.type === 'vote' ? 'Atkvæðagreiðsla' : activity.type}
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
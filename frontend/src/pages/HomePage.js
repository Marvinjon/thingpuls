import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import ForumIcon from '@mui/icons-material/Forum';
import { parliamentService } from '../services/api';

const HomePage = () => {
  const [latestBills, setLatestBills] = useState([]);
  const [latestVotingRecords, setLatestVotingRecords] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [errorBills, setErrorBills] = useState(null);
  const [errorVotes, setErrorVotes] = useState(null);

  // Format status helper
  const formatStatus = (status) => {
    const statusMap = {
      'awaiting_first_reading': 'Bíða 1. umræðu',
      'in_committee': 'Í nefnd',
      'awaiting_second_reading': 'Bíða 2. umræðu',
      'awaiting_third_reading': 'Bíða 3. umræðu',
      'passed': 'Samþykkt',
      'rejected': 'Fellt',
      'withdrawn': 'Dregið til baka',
      'question_sent': 'Fyrirspurn send',
      'question_answered': 'Fyrirspurn svarað'
    };
    return statusMap[status] || status;
  };

  // Get color for status chip
  const getStatusColor = (status) => {
    const colorMap = {
      'awaiting_first_reading': 'info',
      'in_committee': 'warning',
      'awaiting_second_reading': 'info',
      'awaiting_third_reading': 'info',
      'passed': 'success',
      'rejected': 'error',
      'withdrawn': 'default',
      'question_sent': 'info',
      'question_answered': 'success'
    };
    return colorMap[status] || 'default';
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('is-IS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Fetch latest bills
  useEffect(() => {
    const fetchLatestBills = async () => {
      try {
        setLoadingBills(true);
        setErrorBills(null);
        const response = await parliamentService.getBills({
          page: 1,
          limit: 5,
          ordering: '-introduced_date'
        });
        // Limit to 5 items as a safety measure
        const bills = response.data.results || [];
        setLatestBills(bills.slice(0, 5));
      } catch (err) {
        console.error('Error fetching latest bills:', err);
        setErrorBills('Ekki tókst að sækja nýjustu frumvörpin');
      } finally {
        setLoadingBills(false);
      }
    };

    fetchLatestBills();
  }, []);

  // Fetch latest voting records
  useEffect(() => {
    const fetchLatestVotingRecords = async () => {
      try {
        setLoadingVotes(true);
        setErrorVotes(null);
        const response = await parliamentService.getBills({
          page: 1,
          limit: 5,
          has_votes: true,
          ordering: '-vote_date'
        });
        // Limit to 5 items as a safety measure
        const bills = (response.data.results || []).slice(0, 5);
        
        // For each bill, fetch vote counts (only for the 5 bills)
        const billsWithVotes = await Promise.all(
          bills.map(async (bill) => {
            try {
              // Fetch votes with pagination to get all votes efficiently
              const votesResponse = await parliamentService.getBillVotes(bill.id);
              const votes = votesResponse.data.results || [];
              
              // If paginated, we might need to fetch more pages, but for now just use first page
              // This should be enough for most bills
              const voteCounts = { for: 0, against: 0, abstentions: 0, absent: 0 };
              votes.forEach(vote => {
                if (vote.vote === 'yes') voteCounts.for++;
                else if (vote.vote === 'no') voteCounts.against++;
                else if (vote.vote === 'abstain') voteCounts.abstentions++;
                else if (vote.vote === 'absent') voteCounts.absent++;
              });
              
              return {
                ...bill,
                voteCounts
              };
            } catch (err) {
              console.error(`Error fetching votes for bill ${bill.id}:`, err);
              return {
                ...bill,
                voteCounts: { for: 0, against: 0, abstentions: 0, absent: 0 }
              };
            }
          })
        );
        
        setLatestVotingRecords(billsWithVotes);
      } catch (err) {
        console.error('Error fetching latest voting records:', err);
        setErrorVotes('Ekki tókst að sækja nýjustu atkvæðagreiðslurnar');
      } finally {
        setLoadingVotes(false);
      }
    };

    fetchLatestVotingRecords();
  }, []);
  return (
    <>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 6,
          mb: 4,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #02529C, #003270)',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Þingpúls
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Fylgstu með þingstörfum, stjórnmálastarfi og taktu þátt í lýðræðislegri umræðu
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/parliament/members"
          >
            Skoða Þingmenn
          </Button>
        </Container>
      </Paper>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Helstu Eiginleikar
        </Typography>
        <Divider sx={{ mb: 4, width: '100px', mx: 'auto', borderBottomWidth: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Þingmenn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aðgangur að ítarlegum upplýsingum um hvern þingmann, þar með talið atkvæðasögu, ræður, flutt frumvörp og hagsmunaskráningu.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/members" 
                  fullWidth
                >
                  Skoða Þingmenn
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Þingmál
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fylgstu með þingmálum, með upplýsingum um flutningsmenn, breytingar, atkvæðagreiðslur og stöðu.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/bills" 
                  fullWidth
                >
                  Skoða Þingmál
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <HowToVoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Kosningar þingmanna
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sjá hvernig þingmenn hafa kostið í kosningum.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/voting-records" 
                  fullWidth
                >
                  Skoða kosningar
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ForumIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Þátttaka Almennings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taktu þátt í umræðum um frumvörp og stefnumál, og leggðu þitt af mörkum til lýðræðisins með þátttökutækjum okkar.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/engagement/forums" 
                  fullWidth
                >
                  Taka Þátt í Umræðum
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Latest Activity Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Nýjustu Þingstörf
        </Typography>
        <Divider sx={{ mb: 4, width: '100px', mx: 'auto', borderBottomWidth: 3 }} />
        
        <Grid container spacing={3}>
          {/* Latest Bills Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Nýleg Frumvörp
              </Typography>
              <Button variant="outlined" size="small" component={RouterLink} to="/parliament/bills">
                Öll Frumvörp
              </Button>
            </Box>
            
            {loadingBills && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {errorBills && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorBills}
              </Alert>
            )}
            
            {!loadingBills && !errorBills && latestBills.length === 0 && (
              <Alert severity="info">
                Engin frumvörp fundust.
              </Alert>
            )}
            
            {!loadingBills && !errorBills && latestBills.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {latestBills.map((bill) => (
                  <Card
                    key={bill.id}
                    component={RouterLink}
                    to={`/parliament/bills/${bill.id}`}
                    sx={{
                      textDecoration: 'none',
                      display: 'block',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
                          {bill.title}
                        </Typography>
                        {bill.status && (
                          <Chip 
                            label={formatStatus(bill.status)}
                            color={getStatusColor(bill.status)}
                            size="small"
                            sx={{ flexShrink: 0 }}
                          />
                        )}
                      </Box>
                      
                      {bill.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {bill.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                        {bill.introduced_date && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(bill.introduced_date)}
                          </Typography>
                        )}
                        {bill.topics && bill.topics.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {bill.topics.slice(0, 2).map((topic) => (
                              <Chip
                                key={topic.id}
                                label={topic.name}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
          
          {/* Latest Voting Records Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Nýlegar Atkvæðagreiðslur
              </Typography>
              <Button variant="outlined" size="small" component={RouterLink} to="/parliament/voting-records">
                Skoða allar loka atkvæðagreiðslur
              </Button>
            </Box>
            
            {loadingVotes && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {errorVotes && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorVotes}
              </Alert>
            )}
            
            {!loadingVotes && !errorVotes && latestVotingRecords.length === 0 && (
              <Alert severity="info">
                Engar atkvæðagreiðslur fundust.
              </Alert>
            )}
            
            {!loadingVotes && !errorVotes && latestVotingRecords.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {latestVotingRecords.map((record) => (
                  <Card
                    key={record.id}
                    component={RouterLink}
                    to={`/parliament/bills/${record.id}`}
                    sx={{
                      textDecoration: 'none',
                      display: 'block',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {record.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {record.vote_date && (
                          <Typography variant="body2" color="text.secondary">
                            Dagsetning: {formatDate(record.vote_date)}
                          </Typography>
                        )}
                        
                        {record.status && (
                          <Chip 
                            label={formatStatus(record.status)}
                            color={getStatusColor(record.status)}
                            size="small"
                            sx={{ width: 'fit-content' }}
                          />
                        )}
                        
                        {record.voteCounts && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip 
                              label={`Já: ${record.voteCounts.for}`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={`Nei: ${record.voteCounts.against}`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                            {record.voteCounts.abstentions > 0 && (
                              <Chip 
                                label={`Sátu hjá: ${record.voteCounts.abstentions}`}
                                color="warning"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default HomePage; 
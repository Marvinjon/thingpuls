import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Accordion, AccordionSummary, AccordionDetails, Grid,
  Divider, CircularProgress, Alert, List, ListItem, ListItemText,
  ListItemButton, ListItemAvatar, Avatar, LinearProgress, Card,
  CardContent, Stack, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import { parliamentService } from '../../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const response = await parliamentService.getBillById(id);
        setBill(response.data);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError("Failed to load bill details. Please try again later.");
        setLoading(false);
        console.error('Error fetching bill:', err);
      }
    };

    fetchBill();
  }, [id]);

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

  if (!bill) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Bill not found</Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'success';
      case 'rejected':
        return 'error';
      case 'in_committee':
      case 'introduced':
        return 'info';
      case 'in_debate':
      case 'amended':
        return 'warning';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box mb={3}>
        <Button 
          component={RouterLink} 
          to="/parliament/bills" 
          startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)' }} />}
          sx={{ mb: 2 }}
        >
          Til baka
        </Button>
      </Box>
      
      {/* Main Layout - Two Columns */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN - Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Header Card */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="overline" color="text.secondary" fontSize="0.875rem">
            Þingmál #{bill.althingi_id}
          </Typography>
          <Chip 
            label={formatStatus(bill.status)} 
            color={getStatusColor(bill.status)} 
                size="medium"
                sx={{ fontWeight: 600 }}
          />
        </Box>
        
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {bill.title}
        </Typography>

            <Box display="flex" gap={1.5} mt={2} mb={2} flexWrap="wrap" alignItems="center">
          <Chip 
            icon={<AccessTimeIcon />} 
                label={`Lagt fram: ${new Date(bill.introduced_date).toLocaleDateString('is-IS')}`} 
            variant="outlined" 
                size="small"
          />
          {bill.topics?.map((topic) => (
            <Chip 
              key={topic.id}
              label={topic.name} 
                  variant="filled"
                  size="small"
                  sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}
            />
          ))}
        </Box>

            {bill.url && (
              <Button
                href={bill.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                size="small"
                sx={{ fontWeight: 500 }}
              >
                Skoða á Alþingi.is
              </Button>
            )}
          </Paper>

          {/* Description Card */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DescriptionIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Samantekt</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
          {bill.description || 'Engin lýsing í boði.'}
        </Typography>
            </CardContent>
          </Card>

          {/* Voting Records Card */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <HowToVoteIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Atkvæðagreiðslur</Typography>
              </Box>
              {bill.votes?.length > 0 ? (
                <Stack spacing={3}>
                  {bill.votes.map((votingSession) => {
                    const totalVotes = votingSession.yes_count + votingSession.no_count + 
                                      votingSession.abstain_count + votingSession.absent_count;
                    const yesPercent = totalVotes > 0 ? (votingSession.yes_count / totalVotes) * 100 : 0;
                    const noPercent = totalVotes > 0 ? (votingSession.no_count / totalVotes) * 100 : 0;
                    
                    return (
                      <Paper key={votingSession.id} variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {votingSession.title}
                        </Typography>
                        
                        {/* Visual Vote Breakdown */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="success.main" fontWeight={700}>
                                {votingSession.yes_count}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Já
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="error.main" fontWeight={700}>
                                {votingSession.no_count}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Nei
                              </Typography>
                            </Box>
                          </Grid>
                          {votingSession.abstain_count > 0 && (
                            <Grid item xs={6} sm={3}>
                              <Box textAlign="center">
                                <Typography variant="h4" color="warning.main" fontWeight={700}>
                                  {votingSession.abstain_count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Sitja hjá
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {votingSession.absent_count > 0 && (
                            <Grid item xs={6} sm={3}>
                              <Box textAlign="center">
                                <Typography variant="h4" color="text.secondary" fontWeight={700}>
                                  {votingSession.absent_count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Fjarverandi
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>

                        {/* Progress Bar */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.200' }}>
                            <Tooltip title={`${votingSession.yes_count} já (${yesPercent.toFixed(1)}%)`}>
                              <Box 
                                sx={{ 
                                  width: `${yesPercent}%`, 
                                  bgcolor: 'success.main',
                                  transition: 'width 0.3s ease'
                                }} 
                              />
                            </Tooltip>
                            <Tooltip title={`${votingSession.no_count} nei (${noPercent.toFixed(1)}%)`}>
                              <Box 
                                sx={{ 
                                  width: `${noPercent}%`, 
                                  bgcolor: 'error.main',
                                  transition: 'width 0.3s ease'
                                }} 
                              />
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Detailed Vote Breakdown - Expandable */}
                        <Accordion elevation={0} sx={{ '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2" fontWeight={500}>
                              Sjá nákvæma atkvæðagreiðslu
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            <Stack spacing={2}>
                        {/* Yes Votes */}
                        {votingSession.yes_votes?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" color="success.main" fontWeight={600} mb={1.5}>
                                    Já ({votingSession.yes_count})
                              </Typography>
                                  <Grid container spacing={1}>
                                {votingSession.yes_votes.map((mpVote) => (
                                      <Grid item xs={12} sm={6} md={4} key={mpVote.mp_id}>
                                        <Box
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            border: '1px solid',
                                            borderColor: 'success.light',
                                            bgcolor: 'success.lighter',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                              borderColor: 'success.main',
                                              bgcolor: 'success.light',
                                              transform: 'translateY(-2px)',
                                              boxShadow: 1
                                            }
                                          }}
                                        >
                                          <Avatar 
                                            src={mpVote.image_url} 
                                            alt={mpVote.mp_name}
                                            sx={{ width: 36, height: 36 }}
                                          >
                                        <PersonIcon />
                                      </Avatar>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography 
                                              variant="body2" 
                                              fontWeight={500}
                                              noWrap
                                            >
                                              {mpVote.mp_name}
                                            </Typography>
                                            <Typography 
                                              variant="caption" 
                                              color="text.secondary"
                                              noWrap
                                            >
                                              {mpVote.party}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                        )}

                        {/* No Votes */}
                        {votingSession.no_votes?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" color="error.main" fontWeight={600} mb={1.5}>
                                    Nei ({votingSession.no_count})
                              </Typography>
                                  <Grid container spacing={1}>
                                {votingSession.no_votes.map((mpVote) => (
                                      <Grid item xs={12} sm={6} md={4} key={mpVote.mp_id}>
                                        <Box
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            border: '1px solid',
                                            borderColor: 'error.light',
                                            bgcolor: 'secondary.lighter',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                              borderColor: 'error.main',
                                              bgcolor: 'error.lighter',
                                              transform: 'translateY(-2px)',
                                              boxShadow: 1
                                            }
                                          }}
                                        >
                                          <Avatar 
                                            src={mpVote.image_url} 
                                            alt={mpVote.mp_name}
                                            sx={{ width: 36, height: 36 }}
                                          >
                                        <PersonIcon />
                                      </Avatar>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography 
                                              variant="body2" 
                                              fontWeight={500}
                                              noWrap
                                            >
                                              {mpVote.mp_name}
                                            </Typography>
                                            <Typography 
                                              variant="caption" 
                                              color="text.secondary"
                                              noWrap
                                            >
                                              {mpVote.party}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                        )}

                        {/* Abstain Votes */}
                        {votingSession.abstain_votes?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" color="warning.main" fontWeight={600} mb={1.5}>
                                    Sitja hjá ({votingSession.abstain_count})
                              </Typography>
                                  <Grid container spacing={1}>
                                {votingSession.abstain_votes.map((mpVote) => (
                                      <Grid item xs={12} sm={6} md={4} key={mpVote.mp_id}>
                                        <Box
                                          component={RouterLink}
                                          to={`/parliament/members/${mpVote.mp_slug}`}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            border: '1px solid',
                                            borderColor: 'warning.light',
                                            bgcolor: 'warning.lighter',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                              borderColor: 'warning.main',
                                              bgcolor: 'warning.light',
                                              transform: 'translateY(-2px)',
                                              boxShadow: 1
                                            }
                                          }}
                                        >
                                          <Avatar 
                                            src={mpVote.image_url} 
                                            alt={mpVote.mp_name}
                                            sx={{ width: 36, height: 36 }}
                                          >
                                            <PersonIcon />
                                          </Avatar>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography 
                                              variant="body2" 
                                              fontWeight={500}
                                              noWrap
                                            >
                                              {mpVote.mp_name}
                                            </Typography>
                                            <Typography 
                                              variant="caption" 
                                              color="text.secondary"
                                              noWrap
                                            >
                                              {mpVote.party}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                        )}

                        {/* Absent Votes */}
                        {votingSession.absent_votes?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1.5}>
                                    Fjarverandi ({votingSession.absent_count})
                              </Typography>
                                  <Grid container spacing={1}>
                                {votingSession.absent_votes.map((mpVote) => (
                                      <Grid item xs={12} sm={6} md={4} key={mpVote.mp_id}>
                                        <Box
                                          component={RouterLink}
                                          to={`/parliament/members/${mpVote.mp_slug}`}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            border: '1px solid',
                                            borderColor: 'grey.300',
                                            bgcolor: 'grey.100',
                                            opacity: 0.7,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                              borderColor: 'grey.400',
                                              bgcolor: 'grey.200',
                                              opacity: 1,
                                              transform: 'translateY(-2px)',
                                              boxShadow: 1
                                            }
                                          }}
                                        >
                                          <Avatar 
                                            src={mpVote.image_url} 
                                            alt={mpVote.mp_name}
                                            sx={{ width: 36, height: 36 }}
                                          >
                                            <PersonIcon />
                                          </Avatar>
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography 
                                              variant="body2" 
                                              fontWeight={500}
                                              noWrap
                                            >
                                              {mpVote.mp_name}
                                            </Typography>
                                            <Typography 
                                              variant="caption" 
                                              color="text.secondary"
                                              noWrap
                                            >
                                              {mpVote.party}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                        )}
                            </Stack>
                            </AccordionDetails>
                          </Accordion>
                      </Paper>
                    );
                  })}
                </Stack>
                ) : (
                  <Typography color="text.secondary">
                    Engar atkvæðagreiðslur skráðar
                  </Typography>
                )}
            </CardContent>
          </Card>

          {/* Amendments Card */}
          {bill.amendments?.length > 0 && (
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TimelineIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Breytingartillögur</Typography>
                </Box>
                <Stack spacing={1.5}>
                  {bill.amendments.map((amendment) => (
                    <Paper key={amendment.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {amendment.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lagt fram: {new Date(amendment.date).toLocaleDateString('is-IS')}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
          </Grid>

        {/* RIGHT COLUMN - Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Sponsors Card */}
          <Card elevation={2} sx={{ mb: 3, position: 'sticky', top: 24 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Flutningsmenn</Typography>
              </Box>

              {/* Primary Sponsors */}
              {bill.sponsors?.length > 0 && (
                <Box mb={bill.cosponsors?.length > 0 ? 3 : 0}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1.5} textTransform="uppercase" fontSize="0.75rem">
                    Aðalflutningsmenn
                  </Typography>
                  <Stack spacing={1.5}>
                    {bill.sponsors.map((sponsor) => (
                      <Box 
                        key={sponsor.id}
                        component={RouterLink}
                        to={`/parliament/members/${sponsor.slug}`}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          textDecoration: 'none',
                          color: 'inherit',
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'primary.lighter',
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'primary.light',
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Avatar 
                          src={sponsor.image_url} 
                          alt={sponsor.full_name}
                          sx={{ width: 48, height: 48 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {sponsor.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sponsor.party?.name || 'Óháður'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Co-Sponsors */}
              {bill.cosponsors?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1.5} textTransform="uppercase" fontSize="0.75rem">
                    Meðflutningsmenn ({bill.cosponsors.length})
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {bill.cosponsors.map((cosponsor) => (
                      <Tooltip 
                        key={cosponsor.id} 
                        title={`${cosponsor.full_name} - ${cosponsor.party?.name || 'Óháður'}`}
                      >
                        <Avatar 
                          component={RouterLink}
                          to={`/parliament/members/${cosponsor.slug}`}
                          src={cosponsor.image_url} 
                          alt={cosponsor.full_name}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Box>
        </Box>
      )}

              {bill.sponsors?.length === 0 && bill.cosponsors?.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Engir flutningsmenn skráðir
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default BillDetailPage; 
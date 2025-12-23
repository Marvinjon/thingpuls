import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Accordion, AccordionSummary, AccordionDetails, Grid,
  Divider, CircularProgress, Alert, List, ListItem, ListItemText,
  ListItemButton, ListItemAvatar, Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button component={RouterLink} to="/parliament/bills" startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)' }} />}>
          Back to Bills
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="overline" color="text.secondary">
            Þingmál #{bill.althingi_id}
          </Typography>
          <Chip 
            label={formatStatus(bill.status)} 
            color={getStatusColor(bill.status)} 
            variant="outlined"
          />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {bill.title}
        </Typography>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Chip 
            icon={<AccessTimeIcon />} 
            label={`Lagt fram: ${new Date(bill.introduced_date).toLocaleDateString()}`} 
            variant="outlined" 
          />
          {bill.topics?.map((topic) => (
            <Chip 
              key={topic.id}
              label={topic.name} 
              variant="outlined" 
            />
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>Samantekt</Typography>
        <Typography paragraph>
          {bill.description || 'Engin lýsing í boði.'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Flutningsmenn og meðflutningsmenn</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Primary Sponsors */}
                {bill.sponsors?.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Aðalflutningsmenn
                    </Typography>
                    <List>
                      {bill.sponsors.map((sponsor) => (
                        <ListItem 
                          key={sponsor.id} 
                          disablePadding
                          component={RouterLink} 
                          to={`/parliament/members/${sponsor.slug}`}
                          sx={{ 
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemButton>
                            <ListItemAvatar>
                              <Avatar src={sponsor.image_url} alt={sponsor.full_name}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={sponsor.full_name}
                              secondary={sponsor.party?.name || 'Óháður þingmaður'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Co-Sponsors */}
                {bill.cosponsors?.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Meðflutningsmenn
                    </Typography>
                    <List>
                      {bill.cosponsors.map((cosponsor) => (
                        <ListItem 
                          key={cosponsor.id} 
                          disablePadding
                          component={RouterLink} 
                          to={`/parliament/members/${cosponsor.slug}`}
                          sx={{ 
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemButton>
                            <ListItemAvatar>
                              <Avatar src={cosponsor.image_url} alt={cosponsor.full_name}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={cosponsor.full_name}
                              secondary={cosponsor.party?.name || 'Óháður þingmaður'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {bill.sponsors?.length === 0 && bill.cosponsors?.length === 0 && (
                  <Typography color="text.secondary">
                    Engir flutningsmenn skráðir
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Atkvæðagreiðslur</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {bill.votes?.length > 0 ? (
                  <Box>
                    {bill.votes.map((votingSession) => (
                      <Box key={votingSession.id} mb={3}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {votingSession.title}
                        </Typography>
                        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                          <Chip 
                            label={`${votingSession.yes_count} já`} 
                            color="success" 
                            size="small"
                          />
                          <Chip 
                            label={`${votingSession.no_count} nei`} 
                            color="error" 
                            size="small"
                          />
                          {votingSession.abstain_count > 0 && (
                            <Chip 
                              label={`${votingSession.abstain_count} sitja hjá`} 
                              color="warning" 
                              size="small"
                            />
                          )}
                          {votingSession.absent_count > 0 && (
                            <Chip 
                              label={`${votingSession.absent_count} fjarverandi`} 
                              color="default" 
                              size="small"
                            />
                          )}
                        </Box>

                        {/* Yes Votes */}
                        {votingSession.yes_votes?.length > 0 && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" color="success.main">
                                Greiddu atkvæði með ({votingSession.yes_count})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {votingSession.yes_votes.map((mpVote) => (
                                  <ListItem 
                                    key={mpVote.mp_id}
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                      '&:hover': { bgcolor: 'action.hover' },
                                      borderRadius: 1
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar src={mpVote.image_url} alt={mpVote.mp_name}>
                                        <PersonIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary={mpVote.mp_name}
                                      secondary={mpVote.party}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* No Votes */}
                        {votingSession.no_votes?.length > 0 && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" color="error.main">
                                Greiddu atkvæði á móti ({votingSession.no_count})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {votingSession.no_votes.map((mpVote) => (
                                  <ListItem 
                                    key={mpVote.mp_id}
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                      '&:hover': { bgcolor: 'action.hover' },
                                      borderRadius: 1
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar src={mpVote.image_url} alt={mpVote.mp_name}>
                                        <PersonIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary={mpVote.mp_name}
                                      secondary={mpVote.party}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* Abstain Votes */}
                        {votingSession.abstain_votes?.length > 0 && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" color="warning.main">
                                Sátu hjá ({votingSession.abstain_count})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {votingSession.abstain_votes.map((mpVote) => (
                                  <ListItem 
                                    key={mpVote.mp_id}
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                      '&:hover': { bgcolor: 'action.hover' },
                                      borderRadius: 1
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar src={mpVote.image_url} alt={mpVote.mp_name}>
                                        <PersonIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary={mpVote.mp_name}
                                      secondary={mpVote.party}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* Absent Votes */}
                        {votingSession.absent_votes?.length > 0 && (
                          <Accordion sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" color="text.secondary">
                                Fjarverandi ({votingSession.absent_count})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {votingSession.absent_votes.map((mpVote) => (
                                  <ListItem 
                                    key={mpVote.mp_id}
                                    component={RouterLink}
                                    to={`/parliament/members/${mpVote.mp_slug}`}
                                    sx={{ 
                                      '&:hover': { bgcolor: 'action.hover' },
                                      borderRadius: 1
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar src={mpVote.image_url} alt={mpVote.mp_name}>
                                        <PersonIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary={mpVote.mp_name}
                                      secondary={mpVote.party}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Engar atkvæðagreiðslur skráðar
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Breytingartillögur</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {bill.amendments?.length > 0 ? (
                  <List>
                    {bill.amendments.map((amendment) => (
                      <ListItem key={amendment.id}>
                        <ListItemText
                          primary={amendment.title}
                          secondary={`Lagt fram: ${new Date(amendment.date).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    Engar breytingartillögur skráðar
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Villa kom upp við að sækja þingmál: {error}
        </Alert>
      )}
    </Container>
  );
};

export default BillDetailPage; 
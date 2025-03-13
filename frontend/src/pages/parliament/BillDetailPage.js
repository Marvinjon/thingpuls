import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Accordion, AccordionSummary, AccordionDetails, Grid,
  Divider, CircularProgress, Alert, List, ListItem, ListItemText,
  Link, ListItemButton, ListItemAvatar, Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { parliamentService } from '../../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVoteDetails, setShowVoteDetails] = useState(false);

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
                        <ListItem key={sponsor.id} disablePadding>
                          <ListItemButton component={RouterLink} to={`/parliament/members/${sponsor.slug}`}>
                            <ListItemAvatar>
                              <Avatar src={sponsor.image_url} alt={sponsor.full_name}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={sponsor.full_name}
                              secondary={sponsor.party?.name || 'Óháður þingmaður'}
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
                        <ListItem key={cosponsor.id} disablePadding>
                          <ListItemButton component={RouterLink} to={`/parliament/members/${cosponsor.slug}`}>
                            <ListItemAvatar>
                              <Avatar src={cosponsor.image_url} alt={cosponsor.full_name}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={cosponsor.full_name}
                              secondary={cosponsor.party?.name || 'Óháður þingmaður'}
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

          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Atkvæðagreiðslur</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {bill.votes?.length > 0 ? (
                  <List>
                    {bill.votes.map((vote) => (
                      <ListItem key={vote.id}>
                        <ListItemText
                          primary={vote.title}
                          secondary={`${vote.yes_count} já, ${vote.no_count} nei, ${vote.abstain_count} sitja hjá`}
                        />
                      </ListItem>
                    ))}
                  </List>
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
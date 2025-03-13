import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Accordion, AccordionSummary, AccordionDetails, Grid,
  Divider, CircularProgress, Alert, List, ListItem, ListItemText,
  Link
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
            Bill #{bill.althingi_id}
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
            label={`Submitted: ${new Date(bill.introduced_date).toLocaleDateString()}`} 
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
        
        <Typography variant="h6" gutterBottom>Summary</Typography>
        <Typography paragraph>
          {bill.description || 'No description available.'}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {bill.sponsors && bill.sponsors.length > 0 && (
          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} /> Sponsors & Co-sponsors
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Primary Sponsors */}
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Primary Sponsor{bill.sponsors.length > 1 ? 's' : ''}
                  </Typography>
                  {bill.sponsors.map((sponsor) => (
                    <Box key={sponsor.id} mb={2}>
                      <Typography variant="subtitle1">
                        <Link 
                          component={RouterLink} 
                          to={`/parliament/members/${sponsor.slug}`}
                          color="inherit"
                          underline="hover"
                        >
                          {sponsor.first_name} {sponsor.last_name}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sponsor.party_name}
                      </Typography>
                    </Box>
                  ))}

                  {/* Co-sponsors */}
                  {bill.cosponsors && bill.cosponsors.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Co-sponsors ({bill.cosponsors.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {bill.cosponsors.map((cosponsor) => (
                          <Grid item xs={12} sm={6} key={cosponsor.id}>
                            <Typography variant="subtitle2">
                              <Link 
                                component={RouterLink} 
                                to={`/parliament/members/${cosponsor.slug}`}
                                color="inherit"
                                underline="hover"
                              >
                                {cosponsor.first_name} {cosponsor.last_name}
                              </Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {cosponsor.party_name}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {bill.amendments && bill.amendments.length > 0 && (
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} /> Amendments
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {bill.amendments.map((amendment) => (
                    <Box key={amendment.id} mb={2}>
                      <Typography variant="subtitle1">{amendment.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Proposed: {new Date(amendment.date_proposed).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        size="small"
                        label={amendment.status}
                        color={amendment.status === 'adopted' ? 'success' : 
                               amendment.status === 'rejected' ? 'error' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {bill.votes && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HowToVoteIcon sx={{ mr: 1 }} /> Voting Summary
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                    <Chip label={`For: ${bill.votes.yes}`} color="success" />
                    <Chip label={`Against: ${bill.votes.no}`} color="error" />
                    <Chip label={`Abstain: ${bill.votes.abstain}`} />
                    <Chip label={`Absent: ${bill.votes.absent}`} variant="outlined" />
                    <Chip label={`Total: ${bill.votes.total}`} variant="outlined" />
                  </Box>
                  
                  <Box display="flex" gap={2} mb={3}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setShowVoteDetails(prev => !prev)}
                      startIcon={showVoteDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      {showVoteDetails ? 'Hide Vote Details' : 'Show Vote Details'}
                    </Button>
                    <Button 
                      component={RouterLink} 
                      to={`/parliament/voting-records?bill=${bill.id}`} 
                      variant="outlined" 
                      size="small"
                      startIcon={<HowToVoteIcon />}
                    >
                      View All Voting Records
                    </Button>
                  </Box>

                  {showVoteDetails && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Individual Votes</Typography>
                      <Grid container spacing={2}>
                        {['yes', 'no', 'abstain', 'absent'].map((voteType) => (
                          <Grid item xs={12} md={6} key={voteType}>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                  {voteType.charAt(0).toUpperCase() + voteType.slice(1)} ({bill.votes[voteType]})
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <List dense>
                                  {bill.votes[`${voteType}_votes`]?.map((vote) => (
                                    <ListItem key={vote.mp.id}>
                                      <ListItemText
                                        primary={
                                          <Link 
                                            component={RouterLink} 
                                            to={`/parliament/members/${vote.mp.id}`}
                                            color="primary"
                                            underline="hover"
                                          >
                                            {vote.mp.first_name} {vote.mp.last_name}
                                          </Link>
                                        }
                                        secondary={vote.mp.party?.name || 'Independent'}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default BillDetailPage; 
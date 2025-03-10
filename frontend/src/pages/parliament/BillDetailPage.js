import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Accordion, AccordionSummary, AccordionDetails, Grid,
  Divider, CircularProgress, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
        <Button component={Link} to="/parliament/bills" startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)' }} />}>
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
                  <PersonIcon sx={{ mr: 1 }} /> Sponsors
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {bill.sponsors.map((sponsor) => (
                    <Box key={sponsor.id} mb={2}>
                      <Typography variant="subtitle1">
                        {sponsor.first_name} {sponsor.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sponsor.party_name}
                      </Typography>
                    </Box>
                  ))}
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
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip label={`Yes: ${bill.votes.yes}`} color="success" />
                  <Chip label={`No: ${bill.votes.no}`} color="error" />
                  <Chip label={`Abstain: ${bill.votes.abstain}`} />
                  <Chip label={`Absent: ${bill.votes.absent}`} variant="outlined" />
                  <Chip label={`Total: ${bill.votes.total}`} variant="outlined" />
                </Box>
                <Box mt={2}>
                  <Button 
                    component={Link} 
                    to={`/parliament/voting-records?bill=${bill.id}`} 
                    variant="outlined" 
                    size="small"
                    startIcon={<HowToVoteIcon />}
                  >
                    View Detailed Voting Records
                  </Button>
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
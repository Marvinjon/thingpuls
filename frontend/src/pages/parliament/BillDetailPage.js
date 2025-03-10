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
import api from '../../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        // const response = await api.get(`/bills/${id}`);
        
        // Simulated data for development
        const mockData = {
          id: id,
          title: "Bill on Climate Change Mitigation",
          number: `${Math.floor(Math.random() * 300)}/2023`,
          description: "A comprehensive bill aiming to achieve carbon neutrality by 2040 through various environmental protection measures and renewable energy incentives.",
          status: "In committee",
          submissionDate: "2023-06-15",
          lastUpdated: "2023-09-20",
          stage: "Committee Review",
          category: "Environment",
          sponsors: [
            { id: 1, name: "Anna Jónsdóttir", party: "Left-Green Movement" },
            { id: 2, name: "Bjarni Benediktsson", party: "Independence Party" }
          ],
          committees: ["Environment Committee", "Economic Affairs Committee"],
          documents: [
            { id: 1, title: "Original Bill Text", date: "2023-06-15", url: "#" },
            { id: 2, title: "Committee Analysis", date: "2023-08-10", url: "#" },
            { id: 3, title: "Expert Testimony", date: "2023-09-05", url: "#" }
          ],
          votingRecords: [
            { id: 1, stage: "First Reading", date: "2023-07-10", result: "Passed", votes: { for: 33, against: 15, abstentions: 12, absent: 3 } }
          ],
          timeline: [
            { date: "2023-06-15", event: "Bill submitted" },
            { date: "2023-07-10", event: "First reading completed" },
            { date: "2023-07-15", event: "Referred to committee" },
            { date: "2023-09-20", event: "Committee review ongoing" }
          ]
        };
        
        setBill(mockData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load bill details. Please try again later.");
        setLoading(false);
        console.error(err);
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
      case 'failed':
        return 'error';
      case 'in committee':
        return 'info';
      case 'debating':
        return 'warning';
      default:
        return 'default';
    }
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
            Bill #{bill.number}
          </Typography>
          <Chip 
            label={bill.status} 
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
            label={`Submitted: ${bill.submissionDate}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<DescriptionIcon />} 
            label={`Stage: ${bill.stage}`} 
            variant="outlined" 
          />
          <Chip 
            label={bill.category} 
            variant="outlined" 
          />
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>Summary</Typography>
        <Typography paragraph>
          {bill.description}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
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
                    <Typography variant="subtitle1">{sponsor.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{sponsor.party}</Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Committee Involvement
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {bill.committees.map((committee, index) => (
                  <Chip 
                    key={index}
                    label={committee}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1 }} /> Documents
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {bill.documents.map((doc) => (
                  <Box key={doc.id} mb={2}>
                    <Typography variant="subtitle1">
                      <Link to={doc.url}>{doc.title}</Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Published: {doc.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <HowToVoteIcon sx={{ mr: 1 }} /> Voting History
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {bill.votingRecords.length > 0 ? (
                bill.votingRecords.map((record) => (
                  <Box key={record.id} mb={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">{record.stage}</Typography>
                      <Chip 
                        size="small"
                        label={record.result} 
                        color={record.result === "Passed" ? "success" : "error"} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Date: {record.date}
                    </Typography>
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      <Chip size="small" label={`For: ${record.votes.for}`} color="success" />
                      <Chip size="small" label={`Against: ${record.votes.against}`} color="error" />
                      <Chip size="small" label={`Abstentions: ${record.votes.abstentions}`} />
                      <Chip size="small" label={`Absent: ${record.votes.absent}`} variant="outlined" />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No voting records available yet.
                </Typography>
              )}
              <Box mt={2}>
                <Button 
                  component={Link} 
                  to={`/parliament/voting-records?bill=${id}`} 
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

        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Bill Timeline</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ position: 'relative' }}>
                {bill.timeline.map((event, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 3, 
                      ml: 4, 
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: -20,
                        top: 12,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      },
                      '&:after': {
                        content: index < bill.timeline.length - 1 ? '""' : 'none',
                        position: 'absolute',
                        left: -14.5,
                        top: 24,
                        width: 1,
                        height: 'calc(100% + 12px)',
                        bgcolor: 'divider',
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {event.date}
                    </Typography>
                    <Typography variant="body1">
                      {event.event}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BillDetailPage; 
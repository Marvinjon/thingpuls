import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Grid, TextField,
  CircularProgress, Alert,
  Pagination, Button, Link, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../services/api';

// Helper function to get URL parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Format date in Icelandic
const formatDateIcelandic = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const months = [
    'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
    'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
};

// Format status in Icelandic
const formatStatus = (status) => {
  if (!status) return 'Óþekkt';
  
  const statusMap = {
    'awaiting_first_reading': 'Bíða 1. umræðu',
    'in_committee': 'Í nefnd',
    'awaiting_second_reading': 'Bíða 2. umræðu',
    'awaiting_third_reading': 'Bíða 3. umræðu',
    'passed': 'Samþykkt',
    'rejected': 'Fellt',
    'withdrawn': 'Dregið til baka',
    'question_sent': 'Fyrirspurn send',
    'question_answered': 'Fyrirspurn svarað',
    // Handle capitalized versions
    'Awaiting_first_reading': 'Bíða 1. umræðu',
    'In_committee': 'Í nefnd',
    'Awaiting_second_reading': 'Bíða 2. umræðu',
    'Awaiting_third_reading': 'Bíða 3. umræðu',
    'Passed': 'Samþykkt',
    'Rejected': 'Fellt',
    'Withdrawn': 'Dregið til baka',
    'Question_sent': 'Fyrirspurn send',
    'Question_answered': 'Fyrirspurn svarað',
    // Legacy formats
    'Introduced': 'Lagt fram',
    'Failed': 'Hafnað',
    'In Progress': 'Í vinnslu'
  };
  
  return statusMap[status] || status;
};

const VotingRecordsPage = () => {
  const query = useQuery();
  const billId = query.get('bill');
  const memberId = query.get('member');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingRecords, setVotingRecords] = useState([]);
  const [filters, setFilters] = useState({
    bill: billId || '',
    member: memberId || '',
    party: '',
    vote: '',
    dateFrom: '',
    dateTo: '',
    searchQuery: ''
  });
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);  // Bills per page
  const [votesPerPage] = useState(200);  // Votes to fetch (to ensure enough bills)
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allVotes, setAllVotes] = useState({});  // Store all votes across pages
  const [showStats, setShowStats] = useState(false);
  const [sortOrder, setSortOrder] = useState('dateDesc');
  
  // Initialize pendingSearchTerm from searchQuery on first render
  useEffect(() => {
    setPendingSearchTerm(filters.searchQuery);
  }, []);
  
  useEffect(() => {
    const fetchVotingRecords = async () => {
      try {
        setLoading(true);
        
        // NEW APPROACH: Fetch bills that have votes (vote_date is set)
        // This is much more efficient than fetching individual votes
        
        const params = {
          page: page,
          limit: rowsPerPage,
          has_votes: true,  // Only get bills with voting records
        };
        
        // Search in bill title
        if (filters.searchQuery && filters.searchQuery.trim()) {
          params.search = filters.searchQuery.trim();
        }
        
        // Filter by specific bill
        if (filters.bill) {
          params.id = filters.bill;
        }
        
        // Sort order - by vote_date (most recent first by default)
        if (sortOrder === 'dateAsc') {
          params.ordering = 'vote_date';
        } else {
          params.ordering = '-vote_date';
        }
        
        // Fetch bills with votes
        const response = await api.parliamentService.getBills(params);
        const bills = response.data.results || [];
        
        // For each bill, fetch its vote counts
        const billsWithVotes = await Promise.all(
          bills.map(async (bill) => {
            try {
              // Fetch votes for this bill
              const votesResponse = await api.parliamentService.getBillVotes(bill.id);
              const votes = votesResponse.data.results || [];
              
              // Count votes
              const voteCounts = { for: 0, against: 0, abstentions: 0, absent: 0 };
              votes.forEach(vote => {
                if (vote.vote === 'yes') voteCounts.for++;
                else if (vote.vote === 'no') voteCounts.against++;
                else if (vote.vote === 'abstain') voteCounts.abstentions++;
                else if (vote.vote === 'absent') voteCounts.absent++;
              });
              
              // Extract session number from slug if available (format: "session-bill")
              let sessionNumber = null;
              if (bill.session?.session_number) {
                sessionNumber = bill.session.session_number;
              } else if (bill.slug) {
                const slugParts = bill.slug.split('-');
                if (slugParts.length >= 2) {
                  sessionNumber = slugParts[0];
                }
              }
              
              return {
                id: bill.id,
                billNumber: bill.althingi_id || bill.id,
                sessionNumber: sessionNumber,
                billTitle: bill.title || 'Untitled Bill',
                date: bill.vote_date || bill.introduced_date,
                stage: "Loka atkvæðagreiðsla",
                result: bill.status || null,
                totalVotes: voteCounts,
                memberVotes: []
              };
            } catch (err) {
              console.error(`Error fetching votes for bill ${bill.id}:`, err);
              // Return bill without vote counts if fetch fails
              // Extract session number from slug if available (format: "session-bill")
              let sessionNumber = null;
              if (bill.session?.session_number) {
                sessionNumber = bill.session.session_number;
              } else if (bill.slug) {
                const slugParts = bill.slug.split('-');
                if (slugParts.length >= 2) {
                  // Only use if it's a valid number
                  const potentialSession = slugParts[0];
                  if (!isNaN(potentialSession) && potentialSession.trim() !== '') {
                    sessionNumber = potentialSession;
                  }
                }
              }
              
              return {
                id: bill.id,
                billNumber: bill.althingi_id || bill.id,
                sessionNumber: sessionNumber,
                billTitle: bill.title || 'Untitled Bill',
                date: bill.vote_date || bill.introduced_date,
                stage: "Loka atkvæðagreiðsla",
                result: bill.status || null,
                totalVotes: { for: 0, against: 0, abstentions: 0, absent: 0 },
                memberVotes: []
              };
            }
          })
        );
        
        // Set the records and pagination info
        setVotingRecords(billsWithVotes);
        setTotalRecords(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / rowsPerPage));
        
        setLoading(false);
        setIsSearching(false);
      } catch (err) {
        setError("Ekki tókst að sækja atkvæðagreiðslur. Vinsamlegast reyndu aftur síðar.");
        setLoading(false);
        setIsSearching(false);
        console.error(err);
      }
    };

    fetchVotingRecords();
  }, [filters, sortOrder, page, rowsPerPage]);

  const handleSearchInputChange = (e) => {
    setPendingSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Note: Not scrolling to maintain user's scroll position
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setFilters(prev => ({
      ...prev,
      searchQuery: pendingSearchTerm
    }));
    setPage(1);
  };
  
  const handleClearSearch = () => {
    setPendingSearchTerm('');
    setFilters(prev => ({
      ...prev,
      searchQuery: ''
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      bill: '',
      member: '',
      party: '',
      vote: '',
      dateFrom: '',
      dateTo: '',
      searchQuery: ''
    });
    setPage(1);
  };

  // This would get the vote color
  const getVoteColor = (vote) => {
    switch(vote.toLowerCase()) {
      case 'yes':
        return 'success';
      case 'no':
        return 'error';
      case 'abstain':
        return 'warning';
      case 'absent':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get color for status chip
  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    const statusLower = status.toLowerCase();
    const colorMap = {
      'awaiting_first_reading': 'info',
      'in_committee': 'warning',
      'awaiting_second_reading': 'info',
      'awaiting_third_reading': 'info',
      'passed': 'success',
      'rejected': 'error',
      'withdrawn': 'default',
      'question_sent': 'info',
      'question_answered': 'success',
      'failed': 'error',
      'introduced': 'info',
      'in progress': 'default'
    };
    return colorMap[statusLower] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Atkvæðagreiðslur
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Skoðaðu niðurstöður síðustu atkvæðagreiðslna í Alþingi. 
        Vert er að taka fram að hér er bara sýnt síðasta atkvæðagreiðslan fyrir hvert þingmál.
        Sjáðu hvernig þingmenn kjósa
      </Typography>
      
      {billId && votingRecords[0] && (
        <Box mb={3}>
          <Alert severity="info" icon={<DescriptionIcon />}>
            Skoða atkvæðagreiðslur fyrir þingmál #{votingRecords[0].billNumber}/{votingRecords[0].sessionNumber}: {votingRecords[0].billTitle}
            <Button 
              component={RouterLink} 
              to={`/parliament/bills/${votingRecords[0].id}`} 
              size="small" 
              sx={{ ml: 2 }}
            >
              Skoða þingmál
            </Button>
          </Alert>
        </Box>
      )}
      
      {memberId && (
        <Box mb={3}>
          <Alert severity="info" icon={<PersonIcon />}>
            Sýni atkvæðagreiðslur fyrir þingmann
            <Button 
              component={RouterLink} 
              to={`/parliament/members/${memberId}`} 
              size="small" 
              sx={{ ml: 2 }}
            >
              Skoða þingmann
            </Button>
          </Alert>
        </Box>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                label="Leita að atkvæðagreiðslum"
                variant="outlined"
                fullWidth
                value={pendingSearchTerm}
                onChange={handleSearchInputChange}
                placeholder="Leita eftir heiti þingmáls, nafni þingmanns eða leitarorðum"
                InputProps={{
                  endAdornment: (
                    <>
                      {pendingSearchTerm && (
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton type="submit" edge="end" color="primary" disabled={isSearching || loading}>
                        {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
                      </IconButton>
                    </>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<SortIcon />}
                  onClick={() => handleSortChange(sortOrder === 'dateDesc' ? 'dateAsc' : 'dateDesc')}
                  disabled={loading}
                >
                  {sortOrder === 'dateDesc' ? 'Elsta fyrst' : 'Nýjasta fyrst'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
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
          {error}
        </Alert>
      )}

      {/* Search Results Summary */}
      {!loading && !error && votingRecords.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {filters.searchQuery ? (
              `${totalRecords} niðurstöður fyrir "${filters.searchQuery}"`
            ) : (
              `${totalRecords} atkvæðagreiðslur fundust`
            )}
          </Typography>
        </Box>
      )}
      
      {!loading && !error && votingRecords.length === 0 && (
        <Alert severity="info">
          {filters.searchQuery ? (
            <>
              Engar atkvæðagreiðslur fundust fyrir leitina "{filters.searchQuery}".
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleClearSearch}
                sx={{ ml: 2 }}
              >
                Hreinsa leit
              </Button>
            </>
          ) : (
            'Engar atkvæðagreiðslur fundust sem passa við leitarskilyrðin þín.'
          )}
        </Alert>
      )}

      {/* Voting Records Table */}
      {!loading && !error && votingRecords.length > 0 && (
        <>
          {/* Pagination - Top */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Síða {page} af {totalPages} ({totalRecords} niðurstöður)
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Þingmál</TableCell>
                    <TableCell>Dagsetning</TableCell>
                    <TableCell>Niðurstaða</TableCell>
                    <TableCell align="center">Já</TableCell>
                    <TableCell align="center">Nei</TableCell>
                    <TableCell align="center">Situr hjá</TableCell>
                    <TableCell align="center">Fjarverandi</TableCell>
                    <TableCell>Aðgerðir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votingRecords.map((record) => (
                    <TableRow key={`${record.id}-${record.date}`}>
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="subtitle2"
                            component={RouterLink}
                            to={`/parliament/bills/${record.id}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.main'
                              },
                              cursor: 'pointer',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            {record.billTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Þingmál #{record.billNumber}
                          </Typography>
                          <Link 
                            href={record.althingi_voting_id ? 
                              `https://www.althingi.is/thingstorf/thingmalin/atkvaedagreidsla/?nnafnak=${record.althingi_voting_id}` :
                              `https://www.althingi.is/thingstorf/thingmalalistar-eftir-thingum/ferill/${record.sessionNumber}/${record.billNumber}/?ltg=${record.sessionNumber}&mnr=${record.billNumber}`
                            }
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              fontSize: '0.875rem',
                              mt: 0.5 
                            }}
                          >
                            Skoða atkvæðagreiðslu á vef Alþingis
                            <LaunchIcon sx={{ ml: 0.5, fontSize: '0.875rem' }} />
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDateIcelandic(record.date)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatStatus(record.result)}
                          color={getStatusColor(record.result)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{record.totalVotes.for}</TableCell>
                      <TableCell align="center">{record.totalVotes.against}</TableCell>
                      <TableCell align="center">{record.totalVotes.abstentions}</TableCell>
                      <TableCell align="center">{record.totalVotes.absent}</TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/parliament/bills/${record.id}`}
                          size="small"
                          startIcon={<InfoIcon />}
                        >
                          Nánar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          
          {/* Pagination - Bottom */}
          {totalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Síða {page} af {totalPages} ({totalRecords} niðurstöður)
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default VotingRecordsPage; 

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
  const [rowsPerPage] = useState(10);
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
        
        // Build query parameters
        const params = {
          limit: 100,  // Fetch more records at once
        };
        
        if (filters.bill) params.bill = filters.bill;
        if (filters.member) params.mp = filters.member;
        if (filters.party) params.party = filters.party;
        if (filters.vote) params.vote = filters.vote;
        if (filters.dateFrom) params.date_from = filters.dateFrom;
        if (filters.dateTo) params.date_to = filters.dateTo;
        // Note: Search is handled client-side after grouping, not sent to backend
        
        // Sort order
        if (sortOrder === 'dateAsc') params.ordering = 'vote_date';
        else if (sortOrder === 'dateDesc') params.ordering = '-vote_date';
        
        // Fetch all pages of data
        let allResults = [];
        let nextUrl = null;
        let firstResponse = await api.parliamentService.getVotes(params);
        allResults = [...firstResponse.data.results];
        nextUrl = firstResponse.data.next;

        while (nextUrl) {
          const response = await api.parliamentService.getVotes({ ...params, page: nextUrl.split('page=')[1].split('&')[0] });
          allResults = [...allResults, ...response.data.results];
          nextUrl = response.data.next;
        }

        // Process all votes
        const groupedVotes = {};
        
        allResults.forEach(vote => {
          if (!groupedVotes[vote.bill.id]) {
            const billData = {
              id: vote.bill.id,
              billNumber: vote.bill.althingi_id || vote.bill.id,
              sessionNumber: vote.session.session_number,
              billTitle: vote.bill.title || 'Untitled Bill',
              date: vote.vote_date,
              stage: "Final Vote",
              result: vote.bill.status ? 
                     vote.bill.status.charAt(0).toUpperCase() + vote.bill.status.slice(1) : 
                     'In Progress',
              totalVotes: { for: 0, against: 0, abstentions: 0, absent: 0 },
              memberVotes: []
            };
            groupedVotes[vote.bill.id] = billData;
          }
          
          // Add this vote to the appropriate counter
          if (vote.vote === 'yes') groupedVotes[vote.bill.id].totalVotes.for++;
          else if (vote.vote === 'no') groupedVotes[vote.bill.id].totalVotes.against++;
          else if (vote.vote === 'abstain') groupedVotes[vote.bill.id].totalVotes.abstentions++;
          else if (vote.vote === 'absent') groupedVotes[vote.bill.id].totalVotes.absent++;
          
          // Add member vote - translate vote types to Icelandic
          const voteTranslations = {
            'yes': 'Já',
            'no': 'Nei',
            'abstain': 'Situr hjá',
            'absent': 'Fjarverandi'
          };
          
          groupedVotes[vote.bill.id].memberVotes.push({
            memberId: vote.mp.id,
            memberName: `${vote.mp.first_name} ${vote.mp.last_name}`,
            party: vote.mp.party ? vote.mp.party.name : 'Óháður',
            vote: voteTranslations[vote.vote] || vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)
          });
        });
        
        // Convert to array and sort by date
        let processedData = Object.values(groupedVotes).sort((a, b) => {
          if (sortOrder === 'dateDesc') {
            return new Date(b.date) - new Date(a.date);
          }
          return new Date(a.date) - new Date(b.date);
        });
        
        // Apply client-side search filtering
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const searchLower = filters.searchQuery.toLowerCase().trim();
          processedData = processedData.filter(record => {
            // Search in bill title
            const titleMatch = record.billTitle.toLowerCase().includes(searchLower);
            // Search in bill number
            const numberMatch = record.billNumber.toString().includes(searchLower);
            // Search in member names
            const memberMatch = record.memberVotes.some(vote => 
              vote.memberName.toLowerCase().includes(searchLower)
            );
            // Search in party names
            const partyMatch = record.memberVotes.some(vote => 
              vote.party.toLowerCase().includes(searchLower)
            );
            
            return titleMatch || numberMatch || memberMatch || partyMatch;
          });
        }
        
        // Calculate total pages based on filtered data
        const totalItems = processedData.length;
        setTotalRecords(totalItems);
        setTotalPages(Math.ceil(totalItems / rowsPerPage));
        
        // Slice the data for current page
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        setVotingRecords(processedData.slice(startIndex, endIndex));
        
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

  // This would get the result color
  const getResultColor = (result) => {
    switch(result.toLowerCase()) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Atkvæðagreiðslur
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Skoðaðu niðurstöður atkvæðagreiðslna í Alþingi. 
        Finndu ítarlegar upplýsingar um hvernig þingmenn greiddu atkvæði í einstökum þingmálum.
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
      
      {votingRecords.length === 0 ? (
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
      ) : (
        <>
          {!loading && !error && (
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
                          <Typography variant="subtitle2">
                            {record.billTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Þingmál #{record.billNumber}/{record.sessionNumber} • {record.stage}
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
                        {new Date(record.date).toLocaleDateString('is-IS', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.result === 'Passed' ? 'Samþykkt' :
                                 record.result === 'In_committee' ? 'Í nefnd' :
                                 record.result === 'Introduced' ? 'Lagt fram' :
                                 record.result === 'Failed' ? 'Hafnað' :
                                 record.result === 'Withdrawn' ? 'Dregið til baka' :
                                 record.result}
                          color={getResultColor(record.result)}
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
          )}
          
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
        </>
      )}
    </Container>
  );
};

export default VotingRecordsPage; 

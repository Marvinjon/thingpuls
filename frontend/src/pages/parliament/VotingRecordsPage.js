import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Card, CardContent, Grid, TextField, MenuItem, 
  InputAdornment, CircularProgress, Divider, Alert,
  Pagination, Button, IconButton, Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
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
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [sortOrder, setSortOrder] = useState('dateDesc');
  
  useEffect(() => {
    const fetchVotingRecords = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = {
          page,
          limit: rowsPerPage
        };
        
        if (filters.bill) params.bill = filters.bill;
        if (filters.member) params.mp = filters.member;
        if (filters.party) params.party = filters.party;
        if (filters.vote) params.vote = filters.vote;
        if (filters.dateFrom) params.date_from = filters.dateFrom;
        if (filters.dateTo) params.date_to = filters.dateTo;
        if (filters.searchQuery) params.search = filters.searchQuery;
        
        // Sort order
        if (sortOrder === 'dateAsc') params.ordering = 'vote_date';
        else if (sortOrder === 'dateDesc') params.ordering = '-vote_date';
        
        // Fetch data from API
        const response = await api.parliamentService.getVotes(params);
        
        console.log('API Response:', response.data);  // Debug log
        
        // Process the data to group votes by bill
        const groupedVotes = {};
        
        response.data.results.forEach(vote => {
          console.log('Processing vote:', vote);  // Debug log
          
          if (!groupedVotes[vote.bill.id]) {
            const billData = {
              id: vote.bill.id,
              billNumber: vote.bill.althingi_id || vote.bill.id,
              sessionNumber: vote.session.session_number,
              billTitle: vote.bill.title || 'Untitled Bill',
              date: vote.vote_date,
              stage: "Final Vote",
              result: vote.bill.status?.toLowerCase() === 'passed' ? 'Passed' : 
                     vote.bill.status?.toLowerCase() === 'rejected' ? 'Failed' : 
                     vote.bill.status ? vote.bill.status.charAt(0).toUpperCase() + vote.bill.status.slice(1) : '',
              totalVotes: { for: 0, against: 0, abstentions: 0, absent: 0 },
              memberVotes: []
            };
            console.log('Created bill data:', billData);  // Debug log
            groupedVotes[vote.bill.id] = billData;
          }
          
          // Add this vote to the appropriate counter
          if (vote.vote === 'yes') groupedVotes[vote.bill.id].totalVotes.for++;
          else if (vote.vote === 'no') groupedVotes[vote.bill.id].totalVotes.against++;
          else if (vote.vote === 'abstain') groupedVotes[vote.bill.id].totalVotes.abstentions++;
          else if (vote.vote === 'absent') groupedVotes[vote.bill.id].totalVotes.absent++;
          
          // Add member vote
          groupedVotes[vote.bill.id].memberVotes.push({
            memberId: vote.mp.id,
            memberName: `${vote.mp.first_name} ${vote.mp.last_name}`,
            party: vote.mp.party ? vote.mp.party.name : 'Independent',
            vote: vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1) // Capitalize first letter
          });
        });
        
        // Convert to array
        const processedData = Object.values(groupedVotes);
        console.log('Processed data:', processedData);  // Debug log
        
        setVotingRecords(processedData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load voting records. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVotingRecords();
  }, [billId, memberId, filters, page, rowsPerPage, sortOrder]);

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
    // In a real app, this would trigger a search request
    console.log("Search submitted:", filters.searchQuery);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Parliamentary Voting Records
      </Typography>
      
      {billId && votingRecords[0] && (
        <Box mb={3}>
          <Alert severity="info" icon={<DescriptionIcon />}>
            Viewing votes related to Bill #{votingRecords[0].billNumber}/{votingRecords[0].sessionNumber}: {votingRecords[0].billTitle}
            <Button 
              component={RouterLink} 
              to={`/parliament/bills/${votingRecords[0].id}`} 
              size="small" 
              sx={{ ml: 2 }}
            >
              View Bill Details
            </Button>
          </Alert>
        </Box>
      )}
      
      {memberId && (
        <Box mb={3}>
          <Alert severity="info" icon={<PersonIcon />}>
            Viewing votes by {votingRecords[0]?.memberVotes.find(m => m.memberId === parseInt(memberId))?.memberName || 'MP'}
            <Button 
              component={RouterLink} 
              to={`/parliament/members/${memberId}`} 
              size="small" 
              sx={{ ml: 2 }}
            >
              View MP Profile
            </Button>
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search bill title, MP name, or keywords..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                startIcon={<FilterAltIcon />} 
                variant="outlined"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <Button 
                startIcon={<SortIcon />} 
                variant="outlined"
                onClick={() => handleSortChange(sortOrder === 'dateDesc' ? 'dateAsc' : 'dateDesc')}
              >
                {sortOrder === 'dateDesc' ? 'Oldest First' : 'Newest First'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {showStats && (
          <Box mt={3}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  name="party"
                  label="Party"
                  value={filters.party}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All Parties</MenuItem>
                  <MenuItem value="Independence Party">Independence Party</MenuItem>
                  <MenuItem value="Left-Green Movement">Left-Green Movement</MenuItem>
                  <MenuItem value="Progressive Party">Progressive Party</MenuItem>
                  <MenuItem value="Social Democratic Alliance">Social Democratic Alliance</MenuItem>
                  <MenuItem value="Centre Party">Centre Party</MenuItem>
                  <MenuItem value="Pirate Party">Pirate Party</MenuItem>
                  <MenuItem value="Reform">Reform</MenuItem>
                  <MenuItem value="People's Party">People's Party</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  name="vote"
                  label="Vote Type"
                  value={filters.vote}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All Votes</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="abstain">Abstain</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  name="dateFrom"
                  label="From Date"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  name="dateTo"
                  label="To Date"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={resetFilters}
                    size="small"
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {votingRecords.length === 0 ? (
        <Alert severity="info">
          No voting records found matching your search criteria.
        </Alert>
      ) : (
        <>
          {!loading && !error && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>For</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>Abstentions</TableCell>
                    <TableCell>Absent</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Link 
                          component={RouterLink} 
                          to={`/parliament/bills/${record.id}`}
                          color="primary"
                          underline="hover"
                        >
                          Bill #{record.billNumber}/{record.sessionNumber} • {record.stage}
                        </Link>
                        <Typography variant="body2" color="textSecondary">
                          {record.billTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.result ? record.result.charAt(0).toUpperCase() + record.result.slice(1) : ''}
                          color={record.result?.toLowerCase() === 'passed' ? 'success' : 
                                record.result?.toLowerCase() === 'failed' ? 'error' : 
                                'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.totalVotes.for}</TableCell>
                      <TableCell>{record.totalVotes.against}</TableCell>
                      <TableCell>{record.totalVotes.abstentions}</TableCell>
                      <TableCell>{record.totalVotes.absent}</TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/parliament/bills/${record.id}`}
                          size="small"
                          startIcon={<HowToVoteIcon />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={3} // In a real app, this would be calculated from total records
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
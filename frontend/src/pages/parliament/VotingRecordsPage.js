import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Card, CardContent, Grid, TextField, MenuItem, 
  InputAdornment, CircularProgress, Divider, Alert,
  Pagination, Button, IconButton
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
        // This would be replaced with actual API call
        // const response = await api.get('/voting-records', { params: { ...filters, page, limit: rowsPerPage } });
        
        // Simulated data for development
        // In a real application, these would come from the backend with proper filtering
        const mockData = [
          {
            id: 1,
            billNumber: "45/2023",
            billTitle: "Bill on Climate Change Mitigation",
            date: "2023-07-10",
            stage: "First Reading",
            result: "Passed",
            totalVotes: { for: 33, against: 15, abstentions: 12, absent: 3 },
            memberVotes: [
              { memberId: 1, memberName: "Anna Jónsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 2, memberName: "Bjarni Benediktsson", party: "Independence Party", vote: "For" },
              { memberId: 3, memberName: "Katrín Jakobsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 4, memberName: "Sigmundur Davíð Gunnlaugsson", party: "Centre Party", vote: "Against" },
              { memberId: 5, memberName: "Logi Einarsson", party: "Social Democratic Alliance", vote: "For" }
            ]
          },
          {
            id: 2,
            billNumber: "67/2023",
            billTitle: "Bill on Education Reform",
            date: "2023-06-20",
            stage: "Second Reading",
            result: "Passed",
            totalVotes: { for: 40, against: 10, abstentions: 8, absent: 5 },
            memberVotes: [
              { memberId: 1, memberName: "Anna Jónsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 2, memberName: "Bjarni Benediktsson", party: "Independence Party", vote: "For" },
              { memberId: 3, memberName: "Katrín Jakobsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 4, memberName: "Sigmundur Davíð Gunnlaugsson", party: "Centre Party", vote: "For" },
              { memberId: 5, memberName: "Logi Einarsson", party: "Social Democratic Alliance", vote: "Abstain" }
            ]
          },
          {
            id: 3,
            billNumber: "78/2023",
            billTitle: "Bill on Healthcare Funding",
            date: "2023-05-15",
            stage: "Final Vote",
            result: "Failed",
            totalVotes: { for: 25, against: 30, abstentions: 5, absent: 3 },
            memberVotes: [
              { memberId: 1, memberName: "Anna Jónsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 2, memberName: "Bjarni Benediktsson", party: "Independence Party", vote: "Against" },
              { memberId: 3, memberName: "Katrín Jakobsdóttir", party: "Left-Green Movement", vote: "For" },
              { memberId: 4, memberName: "Sigmundur Davíð Gunnlaugsson", party: "Centre Party", vote: "Against" },
              { memberId: 5, memberName: "Logi Einarsson", party: "Social Democratic Alliance", vote: "For" }
            ]
          }
        ];
        
        // Filter by bill if billId is provided
        let filteredData = mockData;
        if (billId) {
          // In a real app, this would filter properly by bill ID
          // For demo, we'll just use the first record
          filteredData = [mockData[0]];
        }
        
        // Filter by member if memberId is provided
        if (memberId) {
          // For demo purposes
          const memberIdNum = parseInt(memberId);
          filteredData = filteredData.filter(record => 
            record.memberVotes.some(vote => vote.memberId === memberIdNum)
          );
        }
        
        setVotingRecords(filteredData);
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
      case 'for':
        return 'success';
      case 'against':
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
      
      {billId && (
        <Box mb={3}>
          <Alert severity="info" icon={<DescriptionIcon />}>
            Viewing votes related to Bill #{votingRecords[0]?.billNumber}: {votingRecords[0]?.billTitle}
            <Button 
              component={Link} 
              to={`/parliament/bills/${billId}`} 
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
              component={Link} 
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
                  <MenuItem value="For">For</MenuItem>
                  <MenuItem value="Against">Against</MenuItem>
                  <MenuItem value="Abstain">Abstain</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
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
          {votingRecords.map((record) => (
            <Card key={record.id} elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" component={Link} to={`/parliament/bills/${record.id}`} sx={{ 
                      textDecoration: 'none', 
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' } 
                    }}>
                      {record.billTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bill #{record.billNumber} • {record.stage}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                      {record.date}
                    </Typography>
                    <Chip 
                      label={record.result} 
                      color={getResultColor(record.result)} 
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'success.light', 
                      color: 'success.contrastText',
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle2">For</Typography>
                      <Typography variant="h6">{record.totalVotes.for}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'error.light', 
                      color: 'error.contrastText',
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle2">Against</Typography>
                      <Typography variant="h6">{record.totalVotes.against}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'warning.light', 
                      color: 'warning.contrastText',
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle2">Abstentions</Typography>
                      <Typography variant="h6">{record.totalVotes.abstentions}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'grey.200', 
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle2">Absent</Typography>
                      <Typography variant="h6">{record.totalVotes.absent}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom>
                  Member Votes
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Member Name</TableCell>
                        <TableCell>Party</TableCell>
                        <TableCell align="center">Vote</TableCell>
                        <TableCell align="right">Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {record.memberVotes.map((memberVote) => (
                        <TableRow key={memberVote.memberId}>
                          <TableCell>
                            <Link 
                              to={`/parliament/members/${memberVote.memberId}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {memberVote.memberName}
                            </Link>
                          </TableCell>
                          <TableCell>{memberVote.party}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={memberVote.vote}
                              color={getVoteColor(memberVote.vote)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              component={Link}
                              to={`/parliament/voting-records?member=${memberVote.memberId}`}
                            >
                              <HowToVoteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {record.memberVotes.length > 5 && (
                  <Box mt={1} textAlign="center">
                    <Button
                      size="small"
                      variant="text"
                      component={Link}
                      to={`/parliament/bills/${record.id}`}
                      endIcon={<InfoIcon />}
                    >
                      View All Votes
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
          
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
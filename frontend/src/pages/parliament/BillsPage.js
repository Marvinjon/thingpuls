import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { parliamentService } from '../../services/api';

const BillsPage = () => {
  // State for bills data
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filter options
  const [topics, setTopics] = useState([]);
  const [years, setYears] = useState([]);
  
  // Fetch bills on component mount and when filters or pagination changes
  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = {
          page: currentPage,
          search: searchTerm,
          status: status || undefined,
          topic: topic || undefined,
          year: year || undefined,
          ordering: sortBy === 'latest' ? '-introduced_date' : 
                   sortBy === 'oldest' ? 'introduced_date' :
                   sortBy === 'title_asc' ? 'title' : '-title'
        };
        
        const response = await parliamentService.getBills(params);
        setBills(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
        
        // Extract unique years from bills if not already set
        if (years.length === 0 && response.data.results) {
          const uniqueYears = [...new Set(response.data.results
            .map(bill => bill.introduced_date?.substring(0, 4))
            .filter(year => year))]
            .sort((a, b) => b - a);
          setYears(uniqueYears);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('Failed to load bills. Please try again later.');
        setBills([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, [currentPage, searchTerm, status, topic, year, sortBy]);
  
  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await parliamentService.getTopics();
        setTopics(response.data || []);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setTopics([]);
      }
    };
    
    fetchTopics();
  }, []);
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0);
  };
  
  // Handle search
  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'status') {
      setStatus(value);
    } else if (name === 'topic') {
      setTopic(value);
    } else if (name === 'year') {
      setYear(value);
    } else if (name === 'sortBy') {
      setSortBy(value);
    }
    
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatus('');
    setTopic('');
    setYear('');
    setSortBy('latest');
    setCurrentPage(1);
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Format status for display
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
  
  // Get color for status chip
  const getStatusColor = (status) => {
    const colorMap = {
      'introduced': 'info',
      'in_committee': 'info',
      'in_debate': 'warning',
      'amended': 'warning',
      'passed': 'success',
      'rejected': 'error',
      'withdrawn': 'default'
    };
    return colorMap[status] || 'default';
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Parliamentary Bills
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse, search, and filter parliamentary bills in the Icelandic Althingi. 
        Find detailed information about proposed legislation, their status, sponsors, and voting results.
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search Bills"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, number, or description"
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" edge="end">
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  name="sortBy"
                  value={sortBy}
                  onChange={handleFilterChange}
                  label="Sort By"
                >
                  <MenuItem value="latest">Latest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                  <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={toggleFilters}
                  sx={{ mr: 1 }}
                >
                  Filters
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<FilterListIcon />}
                  onClick={handleResetFilters}
                  disabled={!status && !topic && !year && sortBy === 'latest'}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Filter Options */}
          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={status}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="introduced">Introduced</MenuItem>
                      <MenuItem value="in_committee">In Committee</MenuItem>
                      <MenuItem value="in_debate">In Debate</MenuItem>
                      <MenuItem value="passed">Passed</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="topic-label">Topic</InputLabel>
                    <Select
                      labelId="topic-label"
                      name="topic"
                      value={topic}
                      onChange={handleFilterChange}
                      label="Topic"
                    >
                      <MenuItem value="">All Topics</MenuItem>
                      {topics.map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="year-label">Year</InputLabel>
                    <Select
                      labelId="year-label"
                      name="year"
                      value={year}
                      onChange={handleFilterChange}
                      label="Year"
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </form>
      </Paper>
      
      {/* Bills List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      ) : bills.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {bills.map((bill) => (
              <Grid item xs={12} key={bill.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {bill.title}
                      </Typography>
                      <Chip 
                        label={formatStatus(bill.status)}
                        color={getStatusColor(bill.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {bill.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {bill.topics?.map((topic) => (
                        <Chip
                          key={topic.id}
                          label={topic.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      component={RouterLink}
                      to={`/parliament/bills/${bill.id}`}
                      size="small"
                      color="primary"
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bills found matching the criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BillsPage; 
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
import ClearIcon from '@mui/icons-material/Clear';
import { parliamentService } from '../../services/api';

// Helper function to get URL parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BillsPage = () => {
  const location = useLocation();
  const query = useQuery();
  // State for bills data
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBills, setTotalBills] = useState(0);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState(query.get('topic') || '');
  const [year, setYear] = useState('');
  const [billType, setBillType] = useState('');
  const [submitterType, setSubmitterType] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filter options
  const [topics, setTopics] = useState([]);
  const [years, setYears] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Fetch bills function that can be called directly
  const fetchBills = useCallback(async (page = 1, search = searchTerm) => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = {
        page: page,
        search: search,
        status: status || undefined,
        topics: topic || undefined,  // Changed from 'topic' to 'topics' to match backend
        year: year || undefined,
        bill_type: billType || undefined,
        submitter_type: submitterType || undefined,
        ordering: sortBy === 'latest' ? '-introduced_date' : 
                 sortBy === 'oldest' ? 'introduced_date' :
                 sortBy === 'title_asc' ? 'title' : '-title'
      };
      
      console.log('Fetching bills with params:', params);
      const response = await parliamentService.getBills(params);
      
      // Only update state if component is still mounted
      if (isMounted) {
        console.log('Bills response:', response.data);
        setBills(response.data.results || []);
        setTotalBills(response.data.count || 0);
        
        // Calculate total pages based on backend page size (20 items per page)
        const PAGE_SIZE = 20; // Must match backend PAGE_SIZE setting
        const totalCount = response.data.count || 0;
        const calculatedPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
        setTotalPages(calculatedPages);
        
        // Extract unique years from bills if not already set
        if (years.length === 0 && response.data.results) {
          const uniqueYears = [...new Set(response.data.results
            .map(bill => bill.introduced_date?.substring(0, 4))
            .filter(year => year))]
            .sort((a, b) => b - a);
          setYears(uniqueYears);
        }
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
      if (isMounted) {
        setError('Failed to load bills. Please try again later.');
        setBills([]);
        setTotalBills(0);
        setTotalPages(1);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsSearching(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [searchTerm, status, topic, year, billType, submitterType, sortBy]);
  
  // Fetch bills when filters or pagination changes
  useEffect(() => {
    fetchBills(currentPage);
  }, [currentPage, fetchBills]);
  
  // Fetch topics on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchTopics = async () => {
      try {
        const response = await parliamentService.getTopics();
        if (isMounted) {
          console.log('Topics response:', response.data);
          // Backend returns paginated response with results array
          const topicsData = response.data.results || response.data || [];
          setTopics(topicsData);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
        if (isMounted) {
          setTopics([]);
        }
      }
    };
    
    fetchTopics();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Apply topic filter from URL query parameter on mount and when URL changes
  useEffect(() => {
    const topicFromUrl = query.get('topic');
    if (topicFromUrl && topicFromUrl !== topic) {
      setTopic(topicFromUrl);
      setShowFilters(true); // Show filters so user can see the applied filter
    } else if (!topicFromUrl && topic) {
      // Clear topic if it's removed from URL
      setTopic('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  // Fetch statistics on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchStatistics = async () => {
      try {
        const response = await parliamentService.getBillStatistics();
        if (isMounted) {
          console.log('Statistics response:', response.data);
          setStatistics(response.data);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        if (isMounted) {
          setStatistics(null);
        }
      }
    };
    
    fetchStatistics();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    // Clear any previous errors when changing page
    setError(null);
    setCurrentPage(value);
    // Note: Not scrolling to top to maintain user's scroll position
  };
  
  // Handle input change in search field
  const handleSearchInputChange = (e) => {
    setPendingSearchTerm(e.target.value);
  };
  
  // Handle search form submission
  const handleSearch = (event) => {
    event.preventDefault();
    // Clear any errors before starting a new search
    setError(null);
    setIsSearching(true);
    setSearchTerm(pendingSearchTerm);
    setCurrentPage(1); // Reset to first page when search changes
    
    // Explicitly call fetchBills with page 1 and the new search term
    // This ensures we don't use the stale currentPage value from closure
    fetchBills(1, pendingSearchTerm);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setError(null);
    setPendingSearchTerm('');
    setSearchTerm('');
    setCurrentPage(1);
    
    // Explicitly fetch bills with page 1 and empty search
    fetchBills(1, '');
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    // Clear any errors before changing filters
    setError(null);
    
    if (name === 'status') {
      setStatus(value);
    } else if (name === 'topic') {
      setTopic(value);
    } else if (name === 'year') {
      setYear(value);
    } else if (name === 'billType') {
      setBillType(value);
    } else if (name === 'submitterType') {
      setSubmitterType(value);
    } else if (name === 'sortBy') {
      setSortBy(value);
    }
    
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setError(null);
    setPendingSearchTerm('');
    setSearchTerm('');
    setStatus('');
    setTopic('');
    setYear('');
    setBillType('');
    setSubmitterType('');
    setSortBy('latest');
    setCurrentPage(1);
    
    // Explicitly fetch bills with reset filters
    fetchBills(1, '');
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'awaiting_first_reading': 'Bíða 1. umræðu',
      'in_committee': 'Í nefnd',
      'awaiting_second_reading': 'Bíða 2. umræðu',
      'awaiting_third_reading': 'Bíða 3. umræðu',
      'passed': 'Samþykkt',
      'rejected': 'Fellt',
      'withdrawn': 'Dregið til baka',
      'question_sent': 'Fyrirspurn send',
      'question_answered': 'Fyrirspurn svarað'
    };
    return statusMap[status] || status;
  };
  
  // Get color for status chip
  const getStatusColor = (status) => {
    const colorMap = {
      'awaiting_first_reading': 'info',
      'in_committee': 'warning',
      'awaiting_second_reading': 'info',
      'awaiting_third_reading': 'info',
      'passed': 'success',
      'rejected': 'error',
      'withdrawn': 'default',
      'question_sent': 'info',
      'question_answered': 'success'
    };
    return colorMap[status] || 'default';
  };
  
  // Determine if there are search results to show
  const hasSearchResults = !loading && !error && bills.length > 0;
  
  // Initialize pendingSearchTerm from searchTerm on first render
  useEffect(() => {
    setPendingSearchTerm(searchTerm);
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 1 }}>
        Þingmál
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
        Smelltu á þingmál til að sjá nánari upplýsingar
      </Typography>
      
      {/* Statistics Overview */}
      {statistics && statistics.status_counts && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Yfirlit
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.status_counts.passed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Samþykkt
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.status_counts.awaiting_first_reading || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bíða 1. umræðu
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.status_counts.in_committee || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Í nefnd
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.status_counts.awaiting_second_reading || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bíða 2. umræðu
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {statistics.status_counts.awaiting_third_reading || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bíða 3. umræðu
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                label="Leita að þingmálum"
                variant="outlined"
                fullWidth
                value={pendingSearchTerm}
                onChange={handleSearchInputChange}
                placeholder="Leita eftir heiti, númeri eða lýsingu"
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
                  startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={toggleFilters}
                  sx={{ mr: 1 }}
                  disabled={loading}
                >
                  Síur
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<FilterListIcon />}
                  onClick={handleResetFilters}
                  disabled={(!status && !topic && !year && !billType && !submitterType && !searchTerm) || loading}
                >
                  Endurstilla
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Filter Options */}
          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="status-label">Staða</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={status}
                      onChange={handleFilterChange}
                      label="Staða"
                      disabled={loading}
                    >
                      <MenuItem value="">Allar stöður</MenuItem>
                      <MenuItem value="awaiting_first_reading">Bíða 1. umræðu</MenuItem>
                      <MenuItem value="in_committee">Í nefnd</MenuItem>
                      <MenuItem value="awaiting_second_reading">Bíða 2. umræðu</MenuItem>
                      <MenuItem value="awaiting_third_reading">Bíða 3. umræðu</MenuItem>
                      <MenuItem value="passed">Samþykkt</MenuItem>
                      <MenuItem value="rejected">Fellt</MenuItem>
                      <MenuItem value="withdrawn">Dregið til baka</MenuItem>
                      <MenuItem value="question_sent">Fyrirspurn send</MenuItem>
                      <MenuItem value="question_answered">Fyrirspurn svarað</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="bill-type-label">Málstegund</InputLabel>
                    <Select
                      labelId="bill-type-label"
                      name="billType"
                      value={billType}
                      onChange={handleFilterChange}
                      label="Málstegund"
                      disabled={loading}
                    >
                      <MenuItem value="">Allar tegundir</MenuItem>
                      <MenuItem value="frumvarp">Frumvörp</MenuItem>
                      <MenuItem value="thingsalyktun">Þingsályktunartillögur</MenuItem>
                      <MenuItem value="fyrirspurn">Fyrirspurnir</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="submitter-type-label">Flytjandi</InputLabel>
                    <Select
                      labelId="submitter-type-label"
                      name="submitterType"
                      value={submitterType}
                      onChange={handleFilterChange}
                      label="Flytjandi"
                      disabled={loading}
                    >
                      <MenuItem value="">Allir flytjendur</MenuItem>
                      <MenuItem value="government">Stjórnarfrumvörp</MenuItem>
                      <MenuItem value="member">Þingmannafrumvörp</MenuItem>
                      <MenuItem value="committee">Nefndafrumvörp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="topic-label">Málaflokkur</InputLabel>
                    <Select
                      labelId="topic-label"
                      name="topic"
                      value={topic}
                      onChange={handleFilterChange}
                      label="Málaflokkur"
                      disabled={loading}
                    >
                      <MenuItem value="">Allir málaflokkar</MenuItem>
                      {topics.map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          {topic.name}
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
      
      {/* Search Results Summary */}
      {!loading && !error && bills.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sýni {bills.length} af {totalBills} þingmálum
          </Typography>
        </Box>
      )}
      
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
      
      {/* No Results */}
      {!loading && !error && bills.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Engin þingmál fundust{searchTerm ? ` fyrir leitina "${searchTerm}"` : ''}.
          {searchTerm && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleClearSearch}
              sx={{ ml: 2 }}
            >
              Hreinsa leit
            </Button>
          )}
        </Alert>
      )}
      
      {/* Bills List - Only show if we have bills and no error and not loading */}
      {!loading && !error && bills.length > 0 && (
        <>
          {/* Pagination - Top */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          <Grid container spacing={3}>
            {bills.map((bill) => (
              <Grid item xs={12} md={6} key={bill.id}>
                <Box
                  component={RouterLink}
                  to={`/parliament/bills/${bill.id}`}
                  sx={{
                    textDecoration: 'none',
                    display: 'block',
                    height: '100%',
                    cursor: 'pointer',
                    padding: '3px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                      backgroundColor: '#d0d0d0'
                    }
                  }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="h6" component="h2" sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3, pr: 1 }}>
                          {bill.title}
                        </Typography>
                        <Chip 
                          label={formatStatus(bill.status)}
                          color={getStatusColor(bill.status)}
                          size="small"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem'
                        }}
                      >
                        {bill.description || 'Engin lýsing tiltæk'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {bill.topics?.slice(0, 2).map((topic) => (
                          <Chip
                            key={topic.id}
                            label={topic.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '24px' }}
                          />
                        ))}
                        {bill.topics?.length > 2 && (
                          <Chip
                            label={`+${bill.topics.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '24px' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
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
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BillsPage; 
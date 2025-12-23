import React, { useState, useEffect, useCallback } from 'react';
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
import ClearIcon from '@mui/icons-material/Clear';
import { parliamentService } from '../../services/api';

const BillsPage = () => {
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
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filter options
  const [topics, setTopics] = useState([]);
  const [years, setYears] = useState([]);
  
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
        topic: topic || undefined,
        year: year || undefined,
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
  }, [searchTerm, status, topic, year, sortBy]);
  
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
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    // Clear any previous errors when changing page
    setError(null);
    setCurrentPage(value);
    window.scrollTo(0, 0);
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
      'introduced': 'Lagt fram',
      'in_committee': 'Í nefnd',
      'in_debate': 'Í umræðu',
      'amended': 'Breytt',
      'passed': 'Samþykkt',
      'rejected': 'Hafnað',
      'withdrawn': 'Dregið til baka'
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
  
  // Determine if there are search results to show
  const hasSearchResults = !loading && !error && bills.length > 0;
  
  // Initialize pendingSearchTerm from searchTerm on first render
  useEffect(() => {
    setPendingSearchTerm(searchTerm);
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Þingmál
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Skoðaðu, leitaðu og síaðu þingmál í Alþingi. 
        Finndu ítarlegar upplýsingar um löggjöf, stöðu þeirra, flutningsmenn og atkvæðagreiðslur.
      </Typography>
      
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
                  disabled={(!status && !topic && !year && !searchTerm) || loading}
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
                <Grid item xs={12} sm={4}>
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
                      <MenuItem value="introduced">Lagt fram</MenuItem>
                      <MenuItem value="in_committee">Í nefnd</MenuItem>
                      <MenuItem value="in_debate">Í umræðu</MenuItem>
                      <MenuItem value="passed">Samþykkt</MenuItem>
                      <MenuItem value="rejected">Hafnað</MenuItem>
                      <MenuItem value="withdrawn">Dregið til baka</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
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
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="year-label">Ár</InputLabel>
                    <Select
                      labelId="year-label"
                      name="year"
                      value={year}
                      onChange={handleFilterChange}
                      label="Ár"
                      disabled={loading}
                    >
                      <MenuItem value="">Öll ár</MenuItem>
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
      
      {/* Search Results Summary */}
      {!loading && !error && bills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? (
              `${bills.length} niðurstöður fyrir "${searchTerm}"`
            ) : (
              `${bills.length} þingmál fundust`
            )}
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
                      Nánari upplýsingar
                    </Button>
                    {bill.url && (
                      <Button
                        href={bill.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        color="secondary"
                      >
                        Skoða á Alþingi.is
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination with count */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Page {currentPage} of {totalPages} ({totalBills} total {totalBills === 1 ? 'bill' : 'bills'})
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
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

export default BillsPage; 
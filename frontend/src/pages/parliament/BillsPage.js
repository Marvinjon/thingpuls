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
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filter options
  const [categories, setCategories] = useState([]);
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
          category: category || undefined,
          year: year || undefined,
          sort_by: sortBy
        };
        
        const response = await parliamentService.getBills(params);
        setBills(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
        setError(null);
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('Failed to load bills. Please try again later.');
        
        // Mock data for development
        const mockBills = [
          {
            id: 1,
            title: 'Climate Change Action Plan',
            description: 'A comprehensive plan to address climate change through renewable energy adoption, carbon emissions reduction, and sustainable practices.',
            status: 'passed',
            introduced_date: '2023-03-10',
            last_modified: '2023-05-15',
            number: '151/2023',
            category: 'Environment',
            year: '2023',
            primary_sponsor: {
              id: 1,
              name: 'Katrín Jakobsdóttir',
              party: 'V',
              party_color: '#1B5E20'
            },
            sponsors_count: 5,
            vote_count: {
              yes: 32,
              no: 18,
              abstain: 5,
              absent: 8
            }
          },
          {
            id: 2,
            title: 'Renewable Energy Investment Act',
            description: 'Bill to increase government investment in renewable energy technologies and create tax incentives for private investments in the sector.',
            status: 'in_committee',
            introduced_date: '2023-05-02',
            last_modified: '2023-05-10',
            number: '172/2023',
            category: 'Energy',
            year: '2023',
            primary_sponsor: {
              id: 2,
              name: 'Bjarni Benediktsson',
              party: 'D',
              party_color: '#0D47A1'
            },
            sponsors_count: 3,
            vote_count: null
          },
          {
            id: 3,
            title: 'Healthcare Reform Act',
            description: 'Comprehensive healthcare reform to improve access to healthcare services in rural areas and reduce waiting times for specialized care.',
            status: 'in_debate',
            introduced_date: '2023-04-15',
            last_modified: '2023-05-01',
            number: '165/2023',
            category: 'Healthcare',
            year: '2023',
            primary_sponsor: {
              id: 3,
              name: 'Willum Þór Þórsson',
              party: 'B',
              party_color: '#33691E'
            },
            sponsors_count: 7,
            vote_count: null
          }
        ];
        
        setBills(mockBills);
        setTotalPages(3);
        
        // Mock filter options
        setCategories(['Environment', 'Energy', 'Healthcare', 'Education', 'Economics', 'Foreign Affairs']);
        setYears(['2023', '2022', '2021', '2020', '2019']);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, [currentPage, searchTerm, status, category, year, sortBy]);
  
  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // In a real app, you would fetch these from the API
        const categoriesResponse = await parliamentService.getBillCategories();
        setCategories(categoriesResponse.data);
        
        const yearsResponse = await parliamentService.getBillYears();
        setYears(yearsResponse.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        // Mock data for development
        setCategories(['Environment', 'Energy', 'Healthcare', 'Education', 'Economics', 'Foreign Affairs']);
        setYears(['2023', '2022', '2021', '2020', '2019']);
      }
    };
    
    fetchFilterOptions();
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
    } else if (name === 'category') {
      setCategory(value);
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
    setCategory('');
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
                  disabled={!status && !category && !year && sortBy === 'latest'}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
        
        {/* Filter Options */}
        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
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
                    <MenuItem value="amended">Amended</MenuItem>
                    <MenuItem value="passed">Passed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="withdrawn">Withdrawn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={category}
                    onChange={handleFilterChange}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="year-label">Parliamentary Year</InputLabel>
                  <Select
                    labelId="year-label"
                    name="year"
                    value={year}
                    onChange={handleFilterChange}
                    label="Parliamentary Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Active Filters Display */}
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {status && (
                <Chip 
                  label={`Status: ${formatStatus(status)}`} 
                  onDelete={() => setStatus('')} 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {category && (
                <Chip 
                  label={`Category: ${category}`} 
                  onDelete={() => setCategory('')} 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {year && (
                <Chip 
                  label={`Year: ${year}`} 
                  onDelete={() => setYear('')} 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {sortBy !== 'latest' && (
                <Chip 
                  label={`Sort: ${sortBy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`} 
                  onDelete={() => setSortBy('latest')} 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Bills List */}
          {bills.length > 0 ? (
            <Grid container spacing={3}>
              {bills.map((bill) => (
                <Grid item xs={12} key={bill.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {bill.title}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Bill {bill.number} • {new Date(bill.introduced_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            label={formatStatus(bill.status)} 
                            color={getStatusColor(bill.status)} 
                            size="small" 
                          />
                          <Chip 
                            label={bill.category} 
                            variant="outlined" 
                            size="small" 
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
                        {bill.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Primary Sponsor:</strong>
                        </Typography>
                        <Chip 
                          label={bill.primary_sponsor.name} 
                          size="small"
                          sx={{ 
                            ml: 1, 
                            bgcolor: bill.primary_sponsor.party_color,
                            color: 'white'
                          }} 
                        />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          <strong>Co-sponsors:</strong> {bill.sponsors_count - 1}
                        </Typography>
                      </Box>
                      
                      {bill.vote_count && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Voting Results:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`Yes: ${bill.vote_count.yes}`} 
                              size="small" 
                              color="success" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`No: ${bill.vote_count.no}`} 
                              size="small" 
                              color="error" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`Abstain: ${bill.vote_count.abstain}`} 
                              size="small" 
                              color="warning" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`Absent: ${bill.vote_count.absent}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="contained"
                        component={RouterLink}
                        to={`/parliament/bills/${bill.id}`}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', my: 6 }}>
              <Typography variant="h6">No bills found matching the criteria</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or filters
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={handleResetFilters}
              >
                Reset All Filters
              </Button>
            </Box>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BillsPage; 
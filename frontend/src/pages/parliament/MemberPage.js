import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
  IconButton,
  Paper,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { parliamentService } from '../../services/api';

const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [constituencies, setConstituencies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    // Load MPs, parties, and constituencies
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch MPs with pagination
        const params = {
          page,
          search: searchTerm,
          party: selectedParty,
          constituency: selectedConstituency,
          ordering: 'first_name,last_name'
        };
        
        const response = await parliamentService.getMembers(params);
        setMembers(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 items per page
        
        // Fetch parties for the filter
        if (parties.length === 0) {
          const partiesResponse = await parliamentService.getParties();
          setParties(partiesResponse.data.results || []);
        }
        
        // Extract unique constituencies from MPs for the filter
        if (constituencies.length === 0 && response.data.results) {
          const uniqueConstituencies = [...new Set(
            response.data.results
              .map(mp => mp.constituency)
              .filter(constituency => constituency)
          )];
          setConstituencies(uniqueConstituencies);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching MPs:', err);
        setError('Failed to load Members of Parliament. Please try again later.');
        setMembers([]);
        setParties([]);
        setConstituencies([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };
    
    fetchData();
  }, [page, searchTerm, selectedParty, selectedConstituency]);

  // Initialize pendingSearchTerm from searchTerm on first render
  useEffect(() => {
    setPendingSearchTerm(searchTerm);
  }, []);
  
  const handleSearchInputChange = (event) => {
    setPendingSearchTerm(event.target.value);
  };
  
  const handleSearch = (event) => {
    event.preventDefault();
    setError(null);
    setIsSearching(true);
    setSearchTerm(pendingSearchTerm);
    setPage(1);
  };
  
  const handleClearSearch = () => {
    setError(null);
    setPendingSearchTerm('');
    setSearchTerm('');
    setPage(1);
  };
  
  const handlePartyChange = (event) => {
    setSelectedParty(event.target.value);
    setPage(1);
  };
  
  const handleConstituencyChange = (event) => {
    setSelectedConstituency(event.target.value);
    setPage(1);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleResetFilters = () => {
    setError(null);
    setPendingSearchTerm('');
    setSearchTerm('');
    setSelectedParty('');
    setSelectedConstituency('');
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Þingmenn
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Leitaðu að núverandi þingmönnum Alþingis.
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                label="Leita að þingmönnum"
                variant="outlined"
                fullWidth
                value={pendingSearchTerm}
                onChange={handleSearchInputChange}
                placeholder="Leita eftir nafni eða kjördæmi"
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
                  disabled={(!selectedParty && !selectedConstituency && !searchTerm) || loading}
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Flokkur</InputLabel>
                    <Select
                      value={selectedParty}
                      onChange={handlePartyChange}
                      label="Flokkur"
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>Allir flokkar</em>
                      </MenuItem>
                      {parties.map((party) => (
                        <MenuItem key={party.id} value={party.id}>
                          {party.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Kjördæmi</InputLabel>
                    <Select
                      value={selectedConstituency}
                      onChange={handleConstituencyChange}
                      label="Kjördæmi"
                      disabled={loading}
                    >
                      <MenuItem value="">
                        <em>Öll kjördæmi</em>
                      </MenuItem>
                      {constituencies.map((constituency) => (
                        <MenuItem key={constituency} value={constituency}>
                          {constituency}
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
      {!loading && !error && members.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? (
              `${members.length} niðurstöður fyrir "${searchTerm}"`
            ) : (
              `${members.length} þingmenn fundust`
            )}
          </Typography>
        </Box>
      )}

      {/* Pagination - Top */}
      {!loading && !error && totalPages > 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Síða {page} af {totalPages}
          </Typography>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
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
          Villa kom upp við að sækja þingmenn: {error}
        </Alert>
      )}

      {/* No Results */}
      {!loading && !error && members.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Engir þingmenn fundust{searchTerm ? ` fyrir leitina "${searchTerm}"` : ''}.
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
      
      {/* MP Grid */}
      {!loading && !error && members.length > 0 && (
        <Grid container spacing={3}>
          {members.map((mp) => (
            <Grid item key={mp.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={RouterLink} 
                  to={`/parliament/members/${mp.slug}`}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  {mp.image_url ? (
                    <CardMedia
                      component="img"
                      height="240"
                      image={mp.image_url}
                      alt={`${mp.first_name} ${mp.last_name}`}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const icon = document.createElement('div');
                        icon.innerHTML = '<svg style="width: 100px; height: 100px; color: #bdbdbd;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4-4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                        e.target.parentElement.appendChild(icon);
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 240, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    </Box>
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {mp.first_name} {mp.last_name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        size="small" 
                        label={mp.party ? mp.party.name : 'Unknown Party'} 
                        sx={{ 
                          bgcolor: mp.party ? mp.party.color || 'primary.main' : 'grey.500',
                          color: 'white',
                          mr: 1,
                          mb: 1
                        }} 
                      />
                      {mp.active && (
                        <Chip 
                          size="small" 
                          label="Active" 
                          color="success" 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {mp.constituency}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Page {page} of {totalPages}
          </Typography>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Container>
  );
};

export default MemberPage; 
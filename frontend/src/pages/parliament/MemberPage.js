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
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { parliamentService } from '../../services/api';

const MemberPage = () => {
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [constituencies, setConstituencies] = useState([]);
  
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
          constituency: selectedConstituency
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
      }
    };
    
    fetchData();
  }, [page, searchTerm, selectedParty, selectedConstituency]);
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handlePartyChange = (event) => {
    setSelectedParty(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleConstituencyChange = (event) => {
    setSelectedConstituency(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Members of Parliament
      </Typography>
      <Typography variant="body1" paragraph>
        Browse and search for current and former Members of the Icelandic Parliament (Alþingi).
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 4, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search MPs"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Party</InputLabel>
              <Select
                value={selectedParty}
                onChange={handlePartyChange}
                label="Party"
              >
                <MenuItem value="">
                  <em>All Parties</em>
                </MenuItem>
                {parties.map((party) => (
                  <MenuItem key={party.id} value={party.id}>
                    {party.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Constituency</InputLabel>
              <Select
                value={selectedConstituency}
                onChange={handleConstituencyChange}
                label="Constituency"
              >
                <MenuItem value="">
                  <em>All Constituencies</em>
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
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* MP Grid */}
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
                          e.target.onerror = null; // Prevent infinite loop
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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

export default MemberPage; 
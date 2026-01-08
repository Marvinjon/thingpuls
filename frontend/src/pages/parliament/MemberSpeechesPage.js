import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Badge,
  IconButton,
  Tooltip,
  Pagination,
  Breadcrumbs,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TodayIcon from '@mui/icons-material/Today';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import { parliamentService } from '../../services/api';

const MemberSpeechesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mp, setMp] = useState(null);
  const [speeches, setSpeeches] = useState([]);
  const [allSpeeches, setAllSpeeches] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [speechesLoading, setSpeechesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch MP data first
        const mpResponse = await parliamentService.getMemberById(id);
        setMp(mpResponse.data);
        
        // Fetch all speeches by paginating through all pages
        let allFetchedSpeeches = [];
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const speechesResponse = await parliamentService.getMemberSpeeches(id, { 
            page: currentPage, 
            page_size: 100 // Try to get more per page
          });
          
          const results = speechesResponse.data.results || [];
          allFetchedSpeeches = [...allFetchedSpeeches, ...results];
          
          console.log(`Fetched page ${currentPage}: ${results.length} speeches (total: ${allFetchedSpeeches.length})`);
          
          // Check if there's a next page
          hasMore = speechesResponse.data.next !== null && results.length > 0;
          currentPage++;
          
          // Safety check to prevent infinite loops
          if (currentPage > 1000) {
            console.warn('Reached maximum page limit while fetching speeches');
            break;
          }
        }
        
        console.log(`Total speeches fetched: ${allFetchedSpeeches.length}`);
        
        setAllSpeeches(allFetchedSpeeches);
        setSpeeches(allFetchedSpeeches.slice(0, PAGE_SIZE));
        setTotalCount(allFetchedSpeeches.length);
        setTotalPages(Math.ceil(allFetchedSpeeches.length / PAGE_SIZE));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePageChange = (event, value) => {
    setPage(value);
    // For now, pagination is handled client-side
    const startIndex = (value - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const filtered = selectedDate 
      ? allSpeeches.filter(s => s.date === selectedDate)
      : allSpeeches;
    setSpeeches(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setPage(1); // Reset to first page when filtering
    
    // Filter speeches by date
    const filtered = date 
      ? allSpeeches.filter(s => s.date === date)
      : allSpeeches;
    
    setSpeeches(filtered.slice(0, PAGE_SIZE));
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
  };

  // Get unique dates for the date selector
  const getUniqueDates = () => {
    const dates = [...new Set(allSpeeches.map(s => s.date))];
    return dates.sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
  };

  // Helper function to format date in Icelandic
  const formatIcelandicDate = (dateString) => {
    if (!dateString) return '';
    
    // Parse the date string (handles YYYY-MM-DD format)
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    
    // Icelandic month names
    const months = [
      'janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
      'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'
    ];
    
    // Icelandic weekday names
    const weekdays = [
      'sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur',
      'fimmtudagur', 'föstudagur', 'laugardagur'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const weekday = weekdays[date.getDay()];
    
    // Format: "Mánudagur 15. janúar 2024"
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day}. ${month} ${year}`;
  };

  // Helper function to group speeches by date
  const groupSpeechesByDate = (speeches) => {
    const grouped = {};
    
    speeches.forEach(speech => {
      const date = speech.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(speech);
    });
    
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        speeches: grouped[date]
      }));
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'Engin gögn';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} mínútur`;
    } else {
      return `${hours} klst ${minutes} mín`;
    }
  };

  // Helper function to format speech type
  const formatSpeechType = (type) => {
    const typeMap = {
      'ræða': 'Ræða',
      'andsvar': 'Andsvar',
      'flutningsræða': 'Flutningsræða',
      'um fundarstjórn': 'Um fundarstjórn',
      'um atkvæðagreiðslu': 'Um atkvæðagreiðslu',
      'um dagskrá': 'Um dagskrá'
    };
    return typeMap[type] || type;
  };

  // Helper function to get sentiment icon
  const getSentimentIcon = (score) => {
    if (!score && score !== 0) return null;
    
    if (score > 0.3) {
      return <SentimentSatisfiedAltIcon color="success" />;
    } else if (score < -0.3) {
      return <SentimentVeryDissatisfiedIcon color="error" />;
    } else {
      return <SentimentNeutralIcon color="warning" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!mp) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No MP data found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/parliament/members"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none' }}
        >
          Þingmenn
        </Button>
        <Button
          component={RouterLink}
          to={`/parliament/members/${id}`}
          sx={{ textTransform: 'none' }}
        >
          {`${mp.first_name} ${mp.last_name}`}
        </Button>
        <Typography color="text.primary">Ræður</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Ræður - {`${mp.first_name} ${mp.last_name}`}
          </Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {totalCount} ræður {selectedDate ? 'á valinni dagsetningu' : 'heildar'}
            </Typography>
          )}
          
          {/* Date Selector */}
          {allSpeeches.length > 0 && (
            <TextField
              select
              label="Veldu dagsetningu"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ minWidth: 250, mb: 2 }}
              size="small"
            >
              <MenuItem value="">
                <em>Allar dagsetningar</em>
              </MenuItem>
              {getUniqueDates().map((date) => (
                <MenuItem key={date} value={date}>
                  {formatIcelandicDate(date)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to={`/parliament/members/${id}`}
          sx={{ ml: 2 }}
        >
          Aftur á prófíl
        </Button>
      </Box>

      {/* Pagination above speeches */}
      {allSpeeches.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Speeches */}
      {speechesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : speeches.length > 0 ? (
        <Box>
          {groupSpeechesByDate(speeches).map(group => (
            <Box key={group.date} sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'primary.light', 
                color: 'white', 
                p: 1, 
                borderRadius: '4px 4px 0 0',
                flexWrap: 'wrap',
                gap: 1
              }}>
                <TodayIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatIcelandicDate(group.date)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'error.main', 
                    color: 'white', 
                    borderRadius: '50%', 
                    minWidth: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    px: 0.5
                  }}>
                    {group.speeches.length}
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {group.speeches.length === 1 ? 'ræða á þessum degi' : 'ræður á þessum degi'}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 0 }}>
                {group.speeches.map((speech, index) => (
                  <Grid item xs={12} sm={6} key={speech.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderTop: 0,
                        borderTopLeftRadius: index === 0 || index === 1 ? 0 : undefined,
                        borderTopRightRadius: index === 0 || index === 1 ? 0 : undefined
                      }}
                    >
                      <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {speech.title || (speech.bill ? speech.bill.title : 'Untitled Speech')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            icon={<MicIcon />} 
                            label={formatSpeechType(speech.speech_type)} 
                            size="small" 
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          {speech.bill && (
                            <Chip
                              icon={<ArticleIcon />}
                              label={speech.bill.title || `Bill #${speech.althingi_bill_id || speech.bill.id}`}
                              size="small"
                              component={RouterLink}
                              to={`/parliament/bills/${speech.bill.id}`}
                              clickable
                              sx={{ maxWidth: '100%' }}
                              title={speech.bill.title || `Bill #${speech.althingi_bill_id || speech.bill.id}`}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {speech.start_time && (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(speech.start_time).toLocaleTimeString('is-IS', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        )}
                        {speech.duration && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDuration(speech.duration)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Media links */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {speech.audio_url && (
                        <Tooltip title="Listen to audio">
                          <IconButton 
                            color="primary" 
                            size="small"
                            component="a" 
                            href={speech.audio_url} 
                            target="_blank"
                          >
                            <VolumeUpIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {speech.video_url && (
                        <Tooltip title="Watch video">
                          <IconButton 
                            color="primary" 
                            size="small"
                            component="a" 
                            href={speech.video_url} 
                            target="_blank"
                          >
                            <OndemandVideoIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {speech.html_url && (
                        <Tooltip title="View transcript">
                          <IconButton 
                            color="primary" 
                            size="small"
                            component="a" 
                            href={speech.html_url} 
                            target="_blank"
                          >
                            <DescriptionIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {speech.sentiment_score !== null && (
                        <Tooltip title={`Sentiment score: ${speech.sentiment_score.toFixed(2)}`}>
                          <Box>
                            {getSentimentIcon(speech.sentiment_score)}
                          </Box>
                        </Tooltip>
                      )}
                    </Stack>
                    
                    {speech.text && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          {speech.text.length > 200 
                            ? `${speech.text.substring(0, 200)}...` 
                            : speech.text}
                        </Typography>
                      </Box>
                    )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      ) : (
        <Alert severity="info">Engar ræður fundust hjá þingmanni.</Alert>
      )}
    </Container>
  );
};

export default MemberSpeechesPage;


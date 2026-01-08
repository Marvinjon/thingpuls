import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent,
  CardActionArea, Chip, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton,
  TextField, InputAdornment, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import { engagementService, parliamentService } from '../../services/api';

const DiscussionForumsPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forumCategories, setForumCategories] = useState([]);
  const [activeThreads, setActiveThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newThreadDialogOpen, setNewThreadDialogOpen] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    topics: [],
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchForumsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch forums, threads, and topics from the backend
        const [forumsResponse, threadsResponse, topicsResponse] = await Promise.all([
          engagementService.getForums({ is_active: true }),
          engagementService.getThreads({ ordering: '-last_activity' }),
          parliamentService.getTopics()
        ]);
        
        setForumCategories(forumsResponse.data.results || forumsResponse.data);
        setActiveThreads(threadsResponse.data.results || threadsResponse.data);
        const topicsData = topicsResponse.data.results || topicsResponse.data || [];
        setTopics(topicsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forum data:', err);
        setError("Ekki tókst að hlaða inn umræðugögnum. Vinsamlegast reyndu aftur síðar.");
        setLoading(false);
      }
    };

    fetchForumsData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNewThreadChange = (e) => {
    const { name, value } = e.target;
    setNewThread(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleTopicsChange = (event) => {
    const value = event.target.value;
    setNewThread(prev => ({
      ...prev,
      topics: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const openNewThreadDialog = () => {
    setNewThreadDialogOpen(true);
  };

  const closeNewThreadDialog = () => {
    setNewThreadDialogOpen(false);
    setNewThread({
      title: '',
      topics: [],
      content: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newThread.title.trim()) {
      errors.title = "Titill er nauðsynlegur";
    }
    // Forum is now optional - no validation needed
    if (!newThread.content.trim()) {
      errors.content = "Efni er nauðsynlegt";
    } else if (newThread.content.trim().length < 10) {
      errors.content = "Efni verður að vera að minnsta kosti 10 stafir";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewThread = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create the thread with topics (no forum)
      const threadData = {
        title: newThread.title,
        topics: newThread.topics
      };
      
      const threadResponse = await engagementService.createThread(threadData);
      
      // Create the first post with the content
      await engagementService.createPost({
        thread: threadResponse.data.id,
        content: newThread.content
      });
      
      closeNewThreadDialog();
      
      // Refresh the threads list
      const threadsResponse = await engagementService.getThreads({ ordering: '-last_activity' });
      setActiveThreads(threadsResponse.data.results || threadsResponse.data);
    } catch (err) {
      console.error("Error creating thread:", err);
      setFormErrors(prev => ({
        ...prev,
        submit: err.response?.data?.detail || "Failed to create thread. Please try again."
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email?.split('@')[0] || 'User';
  };
  
  const getUserInitials = (user) => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    const email = user.email || '';
    return email[0]?.toUpperCase() || '?';
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

  // Filter threads based on search query
  const filteredThreads = activeThreads.filter(thread => {
    const query = searchQuery.toLowerCase();
    return thread.title?.toLowerCase().includes(query);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Umræðuvettvangar
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Taktu þátt í umræðum um íslensk stjórnmál og þingstörf. 
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Search and New Thread Button */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8} md={9}>
                <TextField
                  fullWidth
                  placeholder="Leita að umræðum..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button 
                  fullWidth
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={openNewThreadDialog}
                >
                  Hefja nýja umræðu
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Forum Categories */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            Umræðuvettvangar
          </Typography>
          {forumCategories.length === 0 ? (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Engir umræðuvettvangar í boði ennþá. Athugaðu aftur síðar.
              </Typography>
            </Paper>
          ) : (
          <Grid container spacing={2}>
              {forumCategories.map((forum) => (
                <Grid item xs={12} sm={6} md={4} key={forum.id}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardActionArea 
                    component={Link} 
                      to={`/engagement/forums/${forum.id}`}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ForumIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="h3">
                            {forum.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                          {forum.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Chip 
                          size="small" 
                          icon={<MessageIcon />} 
                            label={`${forum.thread_count || 0} umræður`} 
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          )}
        </Grid>
        
        {/* Active Discussions */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Virkar umræður
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="text.secondary">
                {filteredThreads.length} niðurstöður fyrir "{searchQuery}"
              </Typography>
            )}
          </Box>
          
          <Paper elevation={3}>
            {filteredThreads.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Engar umræður fundust. Reyndu annað leitarorð eða{' '}
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={openNewThreadDialog}
                  >
                    byrjaðu nýja umræðu
                  </Button>
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredThreads.map((thread, index) => {
                  const forumInfo = forumCategories.find(f => f.id === thread.forum);
                  // For threads without forums, we'll need a different URL structure
                  // For now, use a placeholder or handle it differently
                  const threadUrl = thread.forum 
                    ? `/engagement/forums/${thread.forum}/threads/${thread.id}`
                    : `#`; // Placeholder for threads without forums
                  
                  const ListItemComponent = thread.forum ? Link : 'div';
                  
                  return (
                  <React.Fragment key={thread.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      component={ListItemComponent}
                      to={thread.forum ? threadUrl : undefined}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: thread.forum ? 'pointer' : 'default'
                      }}
                    >
                      <ListItemAvatar>
                          <Avatar src={thread.created_by?.profile_image}>
                            {getUserInitials(thread.created_by)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight="medium">
                            {thread.title}
                          </Typography>
                              {thread.is_pinned && (
                                <Chip size="small" label="Fest" color="primary" />
                              )}
                              {thread.is_locked && (
                                <Chip size="small" label="Læst" color="warning" />
                              )}
                              {thread.topics && thread.topics.length > 0 && (
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  {thread.topics.slice(0, 3).map((topic) => (
                                    <Chip 
                                      key={topic.id} 
                                      size="small" 
                                      label={topic.name}
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  ))}
                                  {thread.topics.length > 3 && (
                                    <Chip 
                                      size="small" 
                                      label={`+${thread.topics.length - 3}`}
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Box sx={{ mb: 0.5 }}>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.primary"
                              >
                                {getUserDisplayName(thread.created_by)}
                              </Typography>{' '}
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary"
                              >
                                byrjaði þessa umræðu
                              </Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                                {forumInfo && (
                              <Chip 
                                size="small"
                                    label={forumInfo.title}
                                color="primary"
                                variant="outlined"
                              />
                                )}
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <MessageIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  {thread.post_count || 0} færslur
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  {formatDate(thread.last_activity || thread.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      {thread.forum && (
                        <ListItemSecondaryAction>
                          <IconButton edge="end" component={Link} to={threadUrl}>
                            <ArrowForwardIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    {index < filteredThreads.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* New Thread Dialog */}
      <Dialog 
        open={newThreadDialogOpen} 
        onClose={closeNewThreadDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Hefja nýja umræðu
          <IconButton
            aria-label="loka"
            onClick={closeNewThreadDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Titill umræðu"
              name="title"
              value={newThread.title}
              onChange={handleNewThreadChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="topics-select-label">Efnisflokkar</InputLabel>
              <Select
                labelId="topics-select-label"
                multiple
                value={newThread.topics}
                onChange={handleTopicsChange}
                label="Efnisflokkar"
                renderValue={(selected) => {
                  const selectedTopics = topics.filter(t => selected.includes(t.id));
                  return selectedTopics.map(t => t.name).join(', ');
                }}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Veldu efnisflokka sem tengjast þessari umræðu (valfrjálst)
              </FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Efni umræðu"
              name="content"
              value={newThread.content}
              onChange={handleNewThreadChange}
              multiline
              rows={8}
              error={!!formErrors.content}
              helperText={formErrors.content}
              required
            />
            
            {formErrors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formErrors.submit}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewThreadDialog}>Hætta við</Button>
          <Button 
            onClick={handleSubmitNewThread} 
            variant="contained"
          >
            Búa til umræðu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscussionForumsPage; 
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Grid, Chip, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton,
  TextField, InputAdornment, Button, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  Breadcrumbs
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import MessageIcon from '@mui/icons-material/Message';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../../context/AuthContext';
import { engagementService } from '../../services/api';

const ForumDetailPage = () => {
  const { forumId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newThreadDialogOpen, setNewThreadDialogOpen] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [forumResponse, threadsResponse] = await Promise.all([
          engagementService.getForumById(forumId),
          engagementService.getThreads({ forum: forumId, ordering: '-last_activity' })
        ]);
        
        setForum(forumResponse.data);
        setThreads(threadsResponse.data.results || threadsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forum data:', err);
        setError("Ekki tókst að hlaða inn umræðugögnum. Vinsamlegast reyndu aftur síðar.");
        setLoading(false);
      }
    };

    fetchForumData();
  }, [forumId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNewThreadChange = (e) => {
    const { name, value } = e.target;
    setNewThread(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const openNewThreadDialog = () => {
    setNewThreadDialogOpen(true);
  };

  const closeNewThreadDialog = () => {
    setNewThreadDialogOpen(false);
    setNewThread({
      title: '',
      content: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newThread.title.trim()) {
      errors.title = "Titill er nauðsynlegur";
    }
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
      const threadResponse = await engagementService.createThread({
        title: newThread.title,
        forum: forumId
      });
      
      await engagementService.createPost({
        thread: threadResponse.data.id,
        content: newThread.content
      });
      
      closeNewThreadDialog();
      
      const threadsResponse = await engagementService.getThreads({ forum: forumId, ordering: '-last_activity' });
      setThreads(threadsResponse.data.results || threadsResponse.data);
    } catch (err) {
      console.error("Error creating thread:", err);
      setFormErrors(prev => ({
        ...prev,
        submit: err.response?.data?.detail || "Ekki tókst að búa til umræðu. Vinsamlegast reyndu aftur."
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
    
    if (diffMins < 1) return 'Núna';
    if (diffMins < 60) return `fyrir ${diffMins} mín${diffMins > 1 ? 'útur' : 'útu'}`;
    if (diffHours < 24) return `fyrir ${diffHours} klst${diffHours > 1 ? '.' : '.'}`;
    if (diffDays < 7) return `fyrir ${diffDays} dag${diffDays > 1 ? 'a' : ''}`;
    
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

  if (!forum) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Umræða fannst ekki</Alert>
      </Container>
    );
  }

  const filteredThreads = threads.filter(thread => {
    const query = searchQuery.toLowerCase();
    return thread.title?.toLowerCase().includes(query);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          to="/engagement/forums"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
        >
          <ForumIcon fontSize="small" sx={{ mr: 0.5 }} />
          Umræður
        </Link>
        <Typography color="text.primary">{forum.title}</Typography>
      </Breadcrumbs>

      {/* Forum Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button 
            component={Link} 
            to="/engagement/forums"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Til baka í umræður
          </Button>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <ForumIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {forum.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {forum.description}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={2} mt={2}>
          <Chip 
            icon={<MessageIcon />} 
            label={`${forum.thread_count || 0} umræður`} 
          />
        </Box>
      </Paper>
      
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
        
        {/* Threads List */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            Umræður
          </Typography>
          
          <Paper elevation={3}>
            {filteredThreads.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery ? `Engar umræður fundust fyrir "${searchQuery}"` : 'Engar umræður ennþá. Vertu fyrstur til að byrja!'}
                </Typography>
                {!searchQuery && (
                  <Button 
                    variant="contained" 
                    onClick={openNewThreadDialog}
                    sx={{ mt: 2 }}
                  >
                    Hefja nýja umræðu
                  </Button>
                )}
              </Box>
            ) : (
              <List>
                {filteredThreads.map((thread, index) => {
                  const threadUrl = `/engagement/forums/${forumId}/threads/${thread.id}`;
                  
                  return (
                    <React.Fragment key={thread.id}>
                      <ListItem 
                        alignItems="flex-start" 
                        component={Link}
                        to={threadUrl}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'inherit',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={thread.created_by?.profile_image}>
                            {getUserInitials(thread.created_by)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {thread.title}
                              </Typography>
                              {thread.is_pinned && (
                                <Chip size="small" label="Fest" color="primary" />
                              )}
                              {thread.is_locked && (
                                <Chip size="small" label="Læst" color="warning" />
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
                        <ListItemSecondaryAction>
                          <IconButton edge="end" component={Link} to={threadUrl}>
                            <ArrowForwardIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
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

export default ForumDetailPage;


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
import api from '../../services/api';

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
    category: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchForumsData = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API calls
        // const categoriesResponse = await api.get('/forums/categories');
        // const threadsResponse = await api.get('/forums/threads/active');
        
        // Simulated data for development
        const mockCategories = [
          { 
            id: 1, 
            name: "Legislative Discussions", 
            description: "Discuss current and upcoming bills in parliament", 
            icon: "forum", 
            threads: 145, 
            posts: 2378 
          },
          { 
            id: 2, 
            name: "Political Accountability", 
            description: "Discussions on MP accountability and transparency", 
            icon: "gavel", 
            threads: 87, 
            posts: 1245 
          },
          { 
            id: 3, 
            name: "Electoral Reform", 
            description: "Debate on voting systems and electoral reform", 
            icon: "how_to_vote", 
            threads: 53, 
            posts: 982 
          },
          { 
            id: 4, 
            name: "Environmental Policy", 
            description: "Discussions on climate policy and environmental protection", 
            icon: "nature", 
            threads: 92, 
            posts: 1456 
          },
          { 
            id: 5, 
            name: "Social Services", 
            description: "Debates on healthcare, education and welfare policies", 
            icon: "local_hospital", 
            threads: 78, 
            posts: 1122 
          },
          { 
            id: 6, 
            name: "Economic Affairs", 
            description: "Discussions on economic policy, taxation and fiscal issues", 
            icon: "euro_symbol", 
            threads: 102, 
            posts: 1876 
          }
        ];
        
        const mockThreads = [
          {
            id: 101,
            title: "Impact of the new climate bill on rural communities",
            category: "Environmental Policy",
            author: {
              id: 201,
              name: "Jón Jónsson",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg"
            },
            replies: 24,
            views: 342,
            lastActivity: "2023-09-18T14:30:00Z",
            lastPoster: {
              id: 205,
              name: "Eva Stefánsdóttir"
            }
          },
          {
            id: 102,
            title: "Discussion: Proposed changes to healthcare funding",
            category: "Social Services",
            author: {
              id: 202,
              name: "Anna Guðmundsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/2.jpg"
            },
            replies: 37,
            views: 456,
            lastActivity: "2023-09-19T09:45:00Z",
            lastPoster: {
              id: 209,
              name: "Kristján Gunnarsson"
            }
          },
          {
            id: 103,
            title: "Analysis of voting patterns in recent parliamentary sessions",
            category: "Political Accountability",
            author: {
              id: 203,
              name: "Gunnar Ólafsson",
              avatar: "https://randomuser.me/api/portraits/men/3.jpg"
            },
            replies: 19,
            views: 285,
            lastActivity: "2023-09-17T16:20:00Z",
            lastPoster: {
              id: 203,
              name: "Gunnar Ólafsson"
            }
          },
          {
            id: 104,
            title: "Opinion: The case for proportional representation",
            category: "Electoral Reform",
            author: {
              id: 204,
              name: "Helga Jónsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/4.jpg"
            },
            replies: 42,
            views: 531,
            lastActivity: "2023-09-20T11:15:00Z",
            lastPoster: {
              id: 212,
              name: "Sigurður Björnsson"
            }
          },
          {
            id: 105,
            title: "Discussion on the new tax proposal for small businesses",
            category: "Economic Affairs",
            author: {
              id: 205,
              name: "Eva Stefánsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/5.jpg"
            },
            replies: 31,
            views: 412,
            lastActivity: "2023-09-19T13:50:00Z",
            lastPoster: {
              id: 207,
              name: "Magnús Jóhannesson"
            }
          }
        ];
        
        setForumCategories(mockCategories);
        setActiveThreads(mockThreads);
        setLoading(false);
      } catch (err) {
        setError("Failed to load forum data. Please try again later.");
        setLoading(false);
        console.error(err);
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

  const openNewThreadDialog = () => {
    setNewThreadDialogOpen(true);
  };

  const closeNewThreadDialog = () => {
    setNewThreadDialogOpen(false);
    setNewThread({
      title: '',
      category: '',
      content: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newThread.title.trim()) {
      errors.title = "Title is required";
    }
    if (!newThread.category) {
      errors.category = "Please select a category";
    }
    if (!newThread.content.trim()) {
      errors.content = "Content is required";
    } else if (newThread.content.trim().length < 10) {
      errors.content = "Content must be at least 10 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewThread = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // This would be replaced with an actual API call
      // await api.post('/forums/threads', newThread);
      
      // For development, just close the dialog
      console.log("New thread to be created:", newThread);
      closeNewThreadDialog();
      
      // In a real app, would fetch updated list or add to current list
      // For now, just show a success message
      alert("Thread created successfully! (This is a mock response)");
    } catch (err) {
      console.error("Error creating thread:", err);
      setFormErrors(prev => ({
        ...prev,
        submit: "Failed to create thread. Please try again."
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
  const filteredThreads = activeThreads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discussion Forums
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join the conversation about Icelandic politics and parliamentary affairs. 
          Engage with fellow citizens in respectful and informative discussions.
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
                  placeholder="Search discussions..."
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
                  Start New Discussion
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Forum Categories */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            Forum Categories
          </Typography>
          <Grid container spacing={2}>
            {forumCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardActionArea 
                    component={Link} 
                    to={`/engagement/forums/${category.id}`}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ForumIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="h3">
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {category.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Chip 
                          size="small" 
                          icon={<MessageIcon />} 
                          label={`${category.threads} threads`} 
                        />
                        <Chip 
                          size="small" 
                          icon={<GroupIcon />} 
                          label={`${category.posts} posts`} 
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        {/* Active Discussions */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Active Discussions
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="text.secondary">
                {filteredThreads.length} results for "{searchQuery}"
              </Typography>
            )}
          </Box>
          
          <Paper elevation={3}>
            {filteredThreads.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No discussions found. Try a different search term or{' '}
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={openNewThreadDialog}
                  >
                    start a new discussion
                  </Button>
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredThreads.map((thread, index) => (
                  <React.Fragment key={thread.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      component={Link}
                      to={`/engagement/forums/${thread.category.toLowerCase().replace(/\s+/g, '-')}/threads/${thread.id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={thread.author.avatar}>
                          {thread.author.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {thread.title}
                          </Typography>
                        }
                        secondary={
                          <Box component="span">
                            <Box sx={{ mb: 0.5 }}>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.primary"
                              >
                                {thread.author.name}
                              </Typography>{' '}
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary"
                              >
                                started this discussion
                              </Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                              <Chip 
                                size="small"
                                label={thread.category}
                                color="primary"
                                variant="outlined"
                              />
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <MessageIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {thread.replies} replies
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {thread.views} views
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Last reply: {formatDate(thread.lastActivity)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" component={Link} to={`/engagement/forums/${thread.category.toLowerCase().replace(/\s+/g, '-')}/threads/${thread.id}`}>
                          <ArrowForwardIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredThreads.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
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
          Start a New Discussion
          <IconButton
            aria-label="close"
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
              label="Discussion Title"
              name="title"
              value={newThread.title}
              onChange={handleNewThreadChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!formErrors.category}
              required
            >
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                name="category"
                value={newThread.category}
                onChange={handleNewThreadChange}
                label="Category"
              >
                {forumCategories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.category && (
                <FormHelperText>{formErrors.category}</FormHelperText>
              )}
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Discussion Content"
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
          <Button onClick={closeNewThreadDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitNewThread} 
            variant="contained"
          >
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscussionForumsPage; 
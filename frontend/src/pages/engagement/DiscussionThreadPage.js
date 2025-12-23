import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Divider, Avatar,
  Button, TextField, IconButton, Card, CardHeader, CardContent,
  CardActions, CircularProgress, Alert, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../../context/AuthContext';
import { engagementService } from '../../services/api';

const DiscussionThreadPage = () => {
  const { forumId, threadId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const replyFormRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [forumInfo, setForumInfo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch thread, posts, and forum data
        const [threadResponse, postsResponse, forumResponse] = await Promise.all([
          engagementService.getThreadById(threadId),
          engagementService.getPosts({ thread: threadId, ordering: 'created_at' }),
          engagementService.getForumById(forumId)
        ]);
        
        setThread(threadResponse.data);
        setPosts(postsResponse.data.results || postsResponse.data);
        setForumInfo(forumResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching thread data:', err);
        setError("Ekki tókst að hlaða inn umræðu. Vinsamlegast reyndu aftur síðar.");
        setLoading(false);
      }
    };

    fetchThreadData();
  }, [forumId, threadId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getUserDisplayName = (user) => {
    if (!user) return 'Óþekktur';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email?.split('@')[0] || 'Notandi';
  };
  
  const getUserInitials = (user) => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    const email = user.email || '';
    return email[0]?.toUpperCase() || '?';
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      return;
    }
    
    try {
      const response = await engagementService.createPost({
        thread: threadId,
        content: replyContent
      });
      
      setPosts(prev => [...prev, response.data]);
      setReplyContent('');
      
      // Scroll to the bottom after adding a new reply
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error("Error posting reply:", err);
      setError(err.response?.data?.detail || "Ekki tókst að senda svar. Vinsamlegast reyndu aftur.");
    }
  };

  const handlePostOptionsClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handlePostOptionsClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    handlePostOptionsClose();
  };

  const handleReportSubmit = () => {
    // Report functionality would be implemented with a proper reporting system
    console.log("Report submitted for post:", selectedPost?.id, "Reason:", reportReason);
    setReportDialogOpen(false);
    setReportReason('');
    alert("Takk fyrir tilkynninguna. Umsjónarmenn okkar munu fara yfir hana.");
  };

  const handleEditClick = () => {
    setEditContent(selectedPost.content);
    setEditDialogOpen(true);
    handlePostOptionsClose();
  };

  const handleEditSubmit = async () => {
    try {
      const response = await engagementService.updatePost(selectedPost.id, {
        content: editContent
      });
      
      // Update the post in the UI
      setPosts(prev => 
        prev.map(post => 
          post.id === selectedPost.id ? response.data : post
        )
      );
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.response?.data?.detail || "Ekki tókst að uppfæra færslu. Vinsamlegast reyndu aftur.");
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handlePostOptionsClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await engagementService.deletePost(selectedPost.id);
      
      // Remove the post from the UI
      setPosts(prev => prev.filter(post => post.id !== selectedPost.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.response?.data?.detail || "Ekki tókst að eyða færslu. Vinsamlegast reyndu aftur.");
      setDeleteDialogOpen(false);
    }
  };

  const scrollToReplyForm = () => {
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Focus on the reply textarea
    setTimeout(() => {
      const textarea = replyFormRef.current?.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 500);
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

  if (!thread) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Umræða fannst ekki</Alert>
      </Container>
    );
  }

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
          Umræðuvettvangar
        </Link>
        <Link 
          to={`/engagement/forums/${forumId}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {forumInfo?.title}
        </Link>
        <Typography color="text.primary">Umræða</Typography>
      </Breadcrumbs>
      
      {/* Thread Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button 
            component={Link} 
            to="/engagement/forums"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Til baka í umræðuvettvangi
          </Button>
          <Chip 
            label={forumInfo?.title} 
            color="primary" 
            variant="outlined" 
          />
          {thread?.is_pinned && (
            <Chip 
              label="Fest" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          )}
          {thread?.is_locked && (
            <Chip 
              label="Læst" 
              color="warning" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {thread?.title}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar 
              src={thread?.created_by?.profile_image} 
              alt={getUserDisplayName(thread?.created_by)}
              sx={{ mr: 1 }}
            >
              {getUserInitials(thread?.created_by)}
            </Avatar>
            <Typography variant="body2">
              Byrjað af {getUserDisplayName(thread?.created_by)} þann {formatDate(thread?.created_at)}
            </Typography>
          </Box>
          {!thread?.is_locked && (
            <Button 
              variant="contained" 
              startIcon={<ReplyIcon />}
              onClick={scrollToReplyForm}
            >
              Svara umræðu
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Thread Posts */}
      {posts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Engar færslur ennþá. Vertu fyrstur til að svara!
          </Typography>
        </Paper>
      ) : (
        posts.map((post, index) => {
          const isFirstPost = index === 0;
          const isAuthor = currentUser && post.author?.id === currentUser.id;
          
          return (
            <Card 
              key={post.id} 
              elevation={2} 
              sx={{ mb: 3, border: isFirstPost ? '1px solid' : 'none', borderColor: 'primary.main' }}
            >
              <CardHeader
                avatar={
                  <Avatar src={post.author?.profile_image} alt={getUserDisplayName(post.author)}>
                    {getUserInitials(post.author)}
                  </Avatar>
                }
                action={
                  <IconButton onClick={(e) => handlePostOptionsClick(e, post)}>
                    <MoreVertIcon />
                  </IconButton>
                }
                title={getUserDisplayName(post.author)}
                subheader={
                  <>
                    <Typography variant="caption" display="block">
                      Sett inn þann {formatDate(post.created_at)}
                    </Typography>
                    {post.is_edited && post.updated_at && (
                      <Typography variant="caption" color="text.secondary">
                        Breytt þann {formatDate(post.updated_at)}
                      </Typography>
                    )}
                    {isFirstPost && (
                      <Chip 
                        size="small" 
                        label="Thread Starter" 
                        color="primary" 
                        sx={{ mt: 0.5 }} 
                      />
                    )}
                  </>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions disableSpacing>
                {!thread?.is_locked && (
                  <Button 
                    size="small" 
                    startIcon={<ReplyIcon />}
                    onClick={scrollToReplyForm}
                  >
                    Svara
                  </Button>
                )}
              </CardActions>
            </Card>
          );
        })
      )}
      
      {/* Reply Form */}
      {thread?.is_locked ? (
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: 'action.disabledBackground' }} ref={replyFormRef}>
          <Typography variant="h6" gutterBottom>
            Þessi umræða er læst
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Þessari umræðu hefur verið læst og ekki er hægt að bæta við nýjum svörum.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }} ref={replyFormRef}>
          <Typography variant="h6" gutterBottom>
            Svara þessari umræðu
          </Typography>
          
          <form onSubmit={handleReplySubmit}>
            <TextField
              fullWidth
              label="Svar þitt"
              multiline
              rows={6}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Skrifaðu svar þitt hér..."
              variant="outlined"
              required
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" justifyContent="flex-end">
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!replyContent.trim()}
                startIcon={<ReplyIcon />}
              >
                Senda svar
              </Button>
            </Box>
          </form>
        </Paper>
      )}
      
      {/* Post Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePostOptionsClose}
        keepMounted
      >
        <MenuItem onClick={handleReportClick}>
          <FlagIcon fontSize="small" sx={{ mr: 1 }} />
          Tilkynna
        </MenuItem>
        
        {selectedPost && currentUser && selectedPost.author?.id === currentUser.id && (
          <>
            <MenuItem onClick={handleEditClick}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Breyta
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Eyða
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Report Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Tilkynna færslu
          <IconButton
            aria-label="loka"
            onClick={() => setReportDialogOpen(false)}
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
          <Typography gutterBottom>
            Vinsamlegast útskýrðu hvers vegna þú ert að tilkynna þessa færslu:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Skýrðu ástæðuna fyrir tilkynningunni..."
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Hætta við</Button>
          <Button 
            onClick={handleReportSubmit} 
            variant="contained"
            color="primary"
            disabled={!reportReason.trim()}
          >
            Senda tilkynningu
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Breyta færslu
          <IconButton
            aria-label="loka"
            onClick={() => setEditDialogOpen(false)}
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
          <TextField
            fullWidth
            multiline
            rows={8}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hætta við</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            color="primary"
            disabled={!editContent.trim()}
          >
            Vista breytingar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eyða færslu</DialogTitle>
        <DialogContent>
          <Typography>
            Ertu viss um að þú viljir eyða þessari færslu? Þessa aðgerð er ekki hægt að afturkalla.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hætta við</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Eyða
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscussionThreadPage; 
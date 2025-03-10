import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Chip, Divider, Avatar,
  Button, TextField, IconButton, Card, CardHeader, CardContent,
  CardActions, Grid, CircularProgress, Alert, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
        // This would be replaced with actual API calls
        // const threadResponse = await api.get(`/forums/threads/${threadId}`);
        // const postsResponse = await api.get(`/forums/threads/${threadId}/posts`);
        // const forumResponse = await api.get(`/forums/categories/${forumId}`);
        
        // Simulated data for development
        const mockThread = {
          id: parseInt(threadId),
          title: "Impact of the new climate bill on rural communities",
          author: {
            id: 201,
            name: "Jón Jónsson",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            joinDate: "2022-03-15",
            posts: 87
          },
          createdAt: "2023-09-10T10:30:00Z",
          views: 342,
          category: {
            id: parseInt(forumId),
            name: "Environmental Policy"
          }
        };
        
        const mockPosts = [
          {
            id: 1001,
            threadId: parseInt(threadId),
            content: "The new climate bill introduces several measures that could significantly impact rural communities in Iceland. While the goal of reducing carbon emissions is commendable, I'm concerned about the potential economic burden on farmers and other rural businesses. What are your thoughts on how we can balance environmental goals with economic stability for rural areas?",
            createdAt: "2023-09-10T10:30:00Z",
            updatedAt: null,
            isThreadStarter: true,
            author: {
              id: 201,
              name: "Jón Jónsson",
              avatar: "https://randomuser.me/api/portraits/men/1.jpg"
            },
            likes: 12,
            likedByCurrentUser: false
          },
          {
            id: 1002,
            threadId: parseInt(threadId),
            content: "I agree that we need to consider the economic impact. However, I think the bill offers several opportunities for rural communities to transition to more sustainable practices. The subsidies for renewable energy installation could be particularly beneficial for farms with high energy costs.",
            createdAt: "2023-09-10T11:15:00Z",
            updatedAt: null,
            isThreadStarter: false,
            author: {
              id: 202,
              name: "Anna Guðmundsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/2.jpg"
            },
            likes: 8,
            likedByCurrentUser: true
          },
          {
            id: 1003,
            threadId: parseInt(threadId),
            content: "As someone who works in agriculture, I'm concerned about the proposed carbon tax. While I support the overall goals, has there been any economic analysis on how this will affect small farmers specifically? The bill mentions transition assistance, but details are vague.",
            createdAt: "2023-09-11T08:45:00Z",
            updatedAt: null,
            isThreadStarter: false,
            author: {
              id: 203,
              name: "Gunnar Ólafsson",
              avatar: "https://randomuser.me/api/portraits/men/3.jpg"
            },
            likes: 5,
            likedByCurrentUser: false
          },
          {
            id: 1004,
            threadId: parseInt(threadId),
            content: "I think we need to look at this from a long-term perspective. Climate change itself poses major threats to rural communities through changing weather patterns, increased flooding, etc. While there may be short-term costs, the alternative could be much worse for rural Iceland in the long run.",
            createdAt: "2023-09-11T14:20:00Z",
            updatedAt: null,
            isThreadStarter: false,
            author: {
              id: 204,
              name: "Helga Jónsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/4.jpg"
            },
            likes: 15,
            likedByCurrentUser: false
          },
          {
            id: 1005,
            threadId: parseInt(threadId),
            content: "Has anyone read the section on agricultural subsidies? Page 32 outlines some interesting proposals for subsidizing climate-friendly farming practices. This could actually be beneficial for forward-thinking farmers.",
            createdAt: "2023-09-12T09:10:00Z",
            updatedAt: "2023-09-12T09:45:00Z",
            isThreadStarter: false,
            author: {
              id: 205,
              name: "Eva Stefánsdóttir",
              avatar: "https://randomuser.me/api/portraits/women/5.jpg"
            },
            likes: 7,
            likedByCurrentUser: false
          }
        ];
        
        const mockForumInfo = {
          id: parseInt(forumId),
          name: "Environmental Policy",
          description: "Discussions on climate policy and environmental protection"
        };
        
        setThread(mockThread);
        setPosts(mockPosts);
        setForumInfo(mockForumInfo);
        setLoading(false);
      } catch (err) {
        setError("Failed to load discussion thread. Please try again later.");
        setLoading(false);
        console.error(err);
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      return;
    }
    
    try {
      // This would be replaced with an actual API call
      // await api.post(`/forums/threads/${threadId}/posts`, { content: replyContent });
      
      // For development, simulate adding a new post
      const newPost = {
        id: Math.floor(Math.random() * 10000),
        threadId: parseInt(threadId),
        content: replyContent,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isThreadStarter: false,
        author: {
          id: currentUser?.id || 999,
          name: currentUser?.name || "Current User",
          avatar: currentUser?.avatar || null
        },
        likes: 0,
        likedByCurrentUser: false
      };
      
      setPosts(prev => [...prev, newPost]);
      setReplyContent('');
      
      // Scroll to the bottom after adding a new reply
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error("Error posting reply:", err);
      alert("Failed to post reply. Please try again.");
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
    // This would be replaced with an actual API call
    console.log("Report submitted for post:", selectedPost?.id, "Reason:", reportReason);
    setReportDialogOpen(false);
    setReportReason('');
    alert("Thank you for your report. Our moderators will review it.");
  };

  const handleEditClick = () => {
    setEditContent(selectedPost.content);
    setEditDialogOpen(true);
    handlePostOptionsClose();
  };

  const handleEditSubmit = () => {
    // This would be replaced with an actual API call
    // Update the post in the UI
    setPosts(prev => 
      prev.map(post => 
        post.id === selectedPost.id 
          ? { ...post, content: editContent, updatedAt: new Date().toISOString() } 
          : post
      )
    );
    setEditDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handlePostOptionsClose();
  };

  const handleDeleteConfirm = () => {
    // This would be replaced with an actual API call
    // Remove the post from the UI
    setPosts(prev => prev.filter(post => post.id !== selectedPost.id));
    setDeleteDialogOpen(false);
  };

  const handleLikeToggle = (postId) => {
    // This would be replaced with an actual API call
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          const newLikedStatus = !post.likedByCurrentUser;
          const likeDelta = newLikedStatus ? 1 : -1;
          return {
            ...post,
            likes: post.likes + likeDelta,
            likedByCurrentUser: newLikedStatus
          };
        }
        return post;
      })
    );
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
        <Alert severity="info">Thread not found</Alert>
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
          Forums
        </Link>
        <Link 
          to={`/engagement/forums/${forumId}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {forumInfo?.name}
        </Link>
        <Typography color="text.primary">Thread</Typography>
      </Breadcrumbs>
      
      {/* Thread Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button 
            component={Link} 
            to={`/engagement/forums/${forumId}`}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to {forumInfo?.name}
          </Button>
          <Chip 
            label={forumInfo?.name} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {thread.title}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar 
              src={thread.author.avatar} 
              alt={thread.author.name}
              sx={{ mr: 1 }}
            >
              {thread.author.name.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              Started by <Link to={`/profile/${thread.author.id}`} style={{ textDecoration: 'none' }}>
                {thread.author.name}
              </Link> on {formatDate(thread.createdAt)}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<ReplyIcon />}
            onClick={scrollToReplyForm}
          >
            Reply to Thread
          </Button>
        </Box>
      </Paper>
      
      {/* Thread Posts */}
      {posts.map((post, index) => (
        <Card 
          key={post.id} 
          elevation={2} 
          sx={{ mb: 3, border: post.isThreadStarter ? '1px solid' : 'none', borderColor: 'primary.main' }}
        >
          <CardHeader
            avatar={
              <Avatar src={post.author.avatar} alt={post.author.name}>
                {post.author.name.charAt(0)}
              </Avatar>
            }
            action={
              <IconButton onClick={(e) => handlePostOptionsClick(e, post)}>
                <MoreVertIcon />
              </IconButton>
            }
            title={
              <Link to={`/profile/${post.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {post.author.name}
              </Link>
            }
            subheader={
              <>
                <Typography variant="caption" display="block">
                  Posted on {formatDate(post.createdAt)}
                </Typography>
                {post.updatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Edited on {formatDate(post.updatedAt)}
                  </Typography>
                )}
                {post.isThreadStarter && (
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
            <Button 
              size="small" 
              startIcon={post.likedByCurrentUser ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => handleLikeToggle(post.id)}
              color={post.likedByCurrentUser ? "primary" : "default"}
            >
              {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
            </Button>
            <Button 
              size="small" 
              startIcon={<ReplyIcon />}
              onClick={scrollToReplyForm}
            >
              Reply
            </Button>
          </CardActions>
        </Card>
      ))}
      
      {/* Reply Form */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }} ref={replyFormRef}>
        <Typography variant="h6" gutterBottom>
          Reply to this discussion
        </Typography>
        
        <form onSubmit={handleReplySubmit}>
          <TextField
            fullWidth
            label="Your reply"
            multiline
            rows={6}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Type your reply here..."
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
              Post Reply
            </Button>
          </Box>
        </form>
      </Paper>
      
      {/* Post Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePostOptionsClose}
        keepMounted
      >
        <MenuItem onClick={handleReportClick}>
          <FlagIcon fontSize="small" sx={{ mr: 1 }} />
          Report
        </MenuItem>
        
        {selectedPost && currentUser && selectedPost.author.id === currentUser.id && (
          <>
            <MenuItem onClick={handleEditClick}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
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
          Report Post
          <IconButton
            aria-label="close"
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
            Please explain why you're reporting this post:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Explain the reason for your report..."
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReportSubmit} 
            variant="contained"
            color="primary"
            disabled={!reportReason.trim()}
          >
            Submit Report
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
          Edit Post
          <IconButton
            aria-label="close"
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
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            color="primary"
            disabled={!editContent.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DiscussionThreadPage; 
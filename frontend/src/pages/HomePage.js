import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Paper,
  Divider
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import ForumIcon from '@mui/icons-material/Forum';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          p: 6,
          mb: 4,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #02529C, #003270)',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Iceland Politics Monitoring Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Tracking parliamentary proceedings, political activities, and engaging citizens in the democratic process
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/parliament/members"
          >
            Explore Parliament
          </Button>
        </Container>
      </Paper>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Key Features
        </Typography>
        <Divider sx={{ mb: 4, width: '100px', mx: 'auto', borderBottomWidth: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  MP Profiles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access detailed information about each Member of Parliament, including voting records, speeches, and bills sponsored.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/members" 
                  fullWidth
                >
                  View MPs
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Bill Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor bills as they progress through parliament, with details on sponsors, amendments, and current status.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/bills" 
                  fullWidth
                >
                  View Bills
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <HowToVoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Voting Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyze voting patterns at individual and party levels, with visualizations and historical comparisons.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/voting-records" 
                  fullWidth
                >
                  View Votes
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ForumIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Citizen Engagement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participate in discussions about bills and policies, and contribute to the democratic process through our engagement tools.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/engagement/forums" 
                  fullWidth
                >
                  Join Discussions
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Latest Activity Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Latest Parliamentary Activity
        </Typography>
        <Divider sx={{ mb: 4, width: '100px', mx: 'auto', borderBottomWidth: 3 }} />
        
        <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ flex: '1 1 70%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Bills
            </Typography>
            <Typography variant="body2" paragraph>
              Bill data will be displayed here once connected to the backend API. The latest bills introduced to the Icelandic Parliament will show here with their status and sponsors.
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/parliament/bills">
              See All Bills
            </Button>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Box sx={{ flex: '1 1 30%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Votes
            </Typography>
            <Typography variant="body2" paragraph>
              Information about upcoming votes in parliament will be displayed here once connected to the backend API.
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/parliament/voting-records">
              View Voting Calendar
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default HomePage; 
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
            Þingpúls
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Fylgstu með þingstörfum, stjórnmálastarfi og taktu þátt í lýðræðislegri umræðu
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/parliament/members"
          >
            Skoða Þingmenn
          </Button>
        </Container>
      </Paper>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Helstu Eiginleikar
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
                  Þingmenn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aðgangur að ítarlegum upplýsingum um hvern þingmann, þar með talið atkvæðasögu, ræður, flutt frumvörp og hagsmunaskráningu.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/members" 
                  fullWidth
                >
                  Skoða Þingmenn
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
                  Frumvörp
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fylgstu með frumvörpum í gegnum þingið, með upplýsingum um flutningsmenn, breytingar og stöðu.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/bills" 
                  fullWidth
                >
                  Skoða Frumvörp
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
                  Kosningar þingmanna
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sjá hvernig þingmenn hafa kostið í kosningum.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/parliament/voting-records" 
                  fullWidth
                >
                  Skoða kosningar
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
                  Þátttaka Almennings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taktu þátt í umræðum um frumvörp og stefnumál, og leggðu þitt af mörkum til lýðræðisins með þátttökutækjum okkar.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/engagement/forums" 
                  fullWidth
                >
                  Taka Þátt í Umræðum
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Latest Activity Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Nýjustu Þingstörf
        </Typography>
        <Divider sx={{ mb: 4, width: '100px', mx: 'auto', borderBottomWidth: 3 }} />
        
        <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ flex: '1 1 70%' }}>
            <Typography variant="h6" gutterBottom>
              Nýleg Frumvörp
            </Typography>
            <Typography variant="body2" paragraph>
              Hér birtast nýjustu frumvörpin sem lögð hafa verið fram á Alþingi þegar tenging við gagnagrunn er virk.
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/parliament/bills">
              Öll Frumvörp
            </Button>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Box sx={{ flex: '1 1 30%' }}>
            <Typography variant="h6" gutterBottom>
              Væntanlegar Atkvæðagreiðslur
            </Typography>
            <Typography variant="body2" paragraph>
              Upplýsingar um væntanlegar atkvæðagreiðslur á Alþingi birtast hér þegar tenging við gagnagrunn er virk.
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/parliament/voting-records">
              Skoða Atkvæðadagatal
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default HomePage; 
import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, List, ListItem, ListItemButton, ListItemText, Button, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'primary.dark',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="white" gutterBottom>
              Um vefinn
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Vefgátt Þingpúls er gagnsætt verkfæri til að fylgjast með störfum þingsins
              og þátttöku þingmanna í lýðræðislegu ferli.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="white" gutterBottom>
              Flýtileiðir
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/parliament/members">
                  <ListItemText primary="Þingmenn" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/parliament/bills">
                  <ListItemText primary="Þingmál" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/parliament/voting-records">
                  <ListItemText primary="Atkvæðagreiðslur" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/analytics/dashboard">
                  <ListItemText primary="Tölfræði" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="white" gutterBottom>
              Tenglar
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton component="a" href="https://www.althingi.is" target="_blank">
                  <ListItemText primary="Alþingi" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/about">
                  <ListItemText primary="Um verkefnið" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/privacy">
                  <ListItemText primary="Persónuvernd" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/terms">
                  <ListItemText primary="Skilmálar" sx={{ color: 'white', opacity: 0.9 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="white" gutterBottom>
              Hafðu samband
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }} paragraph>
              Sendu okkur ábendingar eða spurningar
            </Typography>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
              component="a"
              href="mailto:mhmehf@mhmehf.is"
              startIcon={<EmailIcon />}
            >
              Hafa samband
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 5, pb: 3, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.12)', pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="white" sx={{ opacity: 0.7 }} align="center">
              © {new Date().getFullYear()} Þingpúls. Allur réttur áskilinn.
            </Typography>
            <Link
              href="https://github.com/Marvinjon/thingpuls"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'white',
                opacity: 0.7,
                textDecoration: 'none',
                '&:hover': {
                  opacity: 1,
                  textDecoration: 'underline'
                }
              }}
            >
              <GitHubIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                View on GitHub
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 
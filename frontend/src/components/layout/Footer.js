import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';

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
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Politico
            </Typography>
            <Typography variant="body2" color="white">
              A comprehensive platform for monitoring parliamentary proceedings in Iceland, tracking political party activities, and engaging citizens in the democratic process.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Typography variant="body2">
              <Link href="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Home
              </Link>
              <Link href="/parliament/members" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Members of Parliament
              </Link>
              <Link href="/parliament/bills" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Bills
              </Link>
              <Link href="/parliament/voting-records" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Voting Records
              </Link>
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" gutterBottom>
              For suggestions, feedback, or support
            </Typography>
            <Typography variant="body2">
              Email: <Link href="mailto:info@politico-iceland.org" color="inherit">info@politico-iceland.org</Link>
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Politico - Iceland Politics Monitoring Platform
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 
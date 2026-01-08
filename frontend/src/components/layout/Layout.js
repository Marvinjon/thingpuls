import React from 'react';
import { Box, Container, CssBaseline, Alert } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 0,
          textAlign: 'center',
          '& .MuiAlert-message': {
            width: '100%',
          }
        }}
      >
        Síðan er alls ekki fullkominn og ennþá í vinnslu, má endilega senda ábendingar á{' '}
        <Box component="a" href="mailto:mhmehf@mhmehf.is" sx={{ color: 'inherit', textDecoration: 'underline' }}>
          mhmehf@mhmehf.is
        </Box>
      </Alert>
      <Header />
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1,
          py: 4,
        }}
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout; 
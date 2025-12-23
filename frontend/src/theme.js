import { createTheme } from '@mui/material/styles';

// Icelandic flag colors: blue (#02529C), white (#FFFFFF), red (#DC1E35)
// And nature-inspired tones

const theme = createTheme({
  palette: {
    primary: {
      main: '#02529C', // Icelandic blue
      light: '#4F7CBC',
      lighter: '#E3EBF5', // Very light blue for backgrounds
      dark: '#003270',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DC1E35', // Icelandic red
      light: '#E35B6C',
      lighter: '#FDEAED', // Very light red for backgrounds
      dark: '#A5001E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      lighter: '#E8F5E9',
    },
    info: {
      main: '#4F7CBC',
    },
    error: {
      main: '#DC1E35',
      light: '#E35B6C',
      lighter: '#FDEAED',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      lighter: '#FFF3E0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 
import { createTheme } from '@mui/material/styles';

// Color palette derived from the logo
const theme = createTheme({
  palette: {
    primary: {
      main: '#FFF8F5', // Slightly darker white-peach for header
      dark: '#1B75BB', // Blue from logo
      light: '#29ABE2', // Light blue from logo
      contrastText: '#1B75BB', // Using the blue for text
    },
    secondary: {
      main: '#26A9E0', // Another shade of blue from logo
      dark: '#1B75BB',
      light: '#7DCFF3',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF5252',
      light: '#FF867F',
      dark: '#C50E29',
    },
    warning: {
      main: '#FFC107',
      light: '#FFE057',
      dark: '#C79100',
    },
    info: {
      main: '#1B75BB', // Using logo blue for info
      light: '#29ABE2',
      dark: '#145C94',
    },
    success: {
      main: '#4CAF50',
      light: '#80E27E',
      dark: '#087F23',
    },
    background: {
      default: '#FFF5F0', // Lighter white-peach for main background
      paper: '#FFF8F5', // Matching primary.main
    },
    text: {
      primary: '#1B75BB', // Using logo blue for primary text
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;

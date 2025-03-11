import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    primary: {
      main: '#3B82F6',
      dark: '#2563EB',
    },
    secondary: {
      main: '#4F46E5',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#22C55E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF',
    },
    divider: '#4B5563',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1F2937',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F172A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#4B5563',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#4B5563',
            },
            '&:hover fieldset': {
              borderColor: '#3B82F6',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4B5563',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B82F6',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937',
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1F2937',
          borderRadius: 12,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ] as const,
});

/**
 * Main App component
 * Sets up providers and global layout
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <BrowserRouter>
            <Layout>
              <AppRoutes />
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

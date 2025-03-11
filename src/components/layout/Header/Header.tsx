import { AppBar, Toolbar, Typography, Button, Box, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * Header component for the application
 * Contains the application title, navigation links, and user controls
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  /**
   * Handles logout button click
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  const navButtonStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 2,
    py: 1,
    borderRadius: 1,
    transition: 'all 0.3s',
    backgroundColor: isCurrentPath(path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      transform: 'translateY(-2px)',
    },
  });

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        width: '100%',
        boxShadow: theme.shadows[4],
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Medical System
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={navButtonStyle('/')}
              >
                <DashboardIcon />
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/patients')}
                sx={navButtonStyle('/patients')}
              >
                <PersonIcon />
                Patients
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/doctors')}
                sx={navButtonStyle('/doctors')}
              >
                <MedicalServicesIcon />
                Doctors
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/examinations')}
                sx={navButtonStyle('/examinations')}
              >
                <MonitorHeartIcon />
                Examinations
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/prescriptions')}
                sx={navButtonStyle('/prescriptions')}
              >
                <MedicationIcon />
                Prescriptions
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500 
                }}
              >
                {user?.username}
              </Typography>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <LogoutIcon />
                Logout
              </Button>
            </Box>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            onClick={() => navigate('/login')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
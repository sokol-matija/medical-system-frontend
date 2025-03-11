import { AppBar, Toolbar, Typography, Button, Box, useTheme, IconButton, Drawer, List, ListItemIcon, ListItemText, useMediaQuery, Divider, ListItemButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

/**
 * Header component for the application
 * Contains the application title, navigation links, and user controls
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * Handles logout button click
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Patients', icon: <PersonIcon />, path: '/patients' },
    { text: 'Doctors', icon: <MedicalServicesIcon />, path: '/doctors' },
    { text: 'Examinations', icon: <MonitorHeartIcon />, path: '/examinations' },
    { text: 'Prescriptions', icon: <MedicationIcon />, path: '/prescriptions' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.text} 
            onClick={() => navigate(item.path)}
            selected={isCurrentPath(item.path)}
            sx={{
              backgroundColor: isCurrentPath(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
              },
              my: 0.5,
              borderRadius: 1,
              mx: 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isCurrentPath(item.path) ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            my: 0.5,
            borderRadius: 1,
            mx: 1,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              color: theme.palette.common.white,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

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
          <>
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {navigationItems.map((item) => (
                    <Button 
                      key={item.text}
                      color="inherit" 
                      onClick={() => navigate(item.path)}
                      sx={navButtonStyle(item.path)}
                    >
                      {item.icon}
                      {item.text}
                    </Button>
                  ))}
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
            )}
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
              }}
            >
              {drawer}
            </Drawer>
          </>
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
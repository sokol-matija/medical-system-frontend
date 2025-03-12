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
import HomeIcon from '@mui/icons-material/Home';
import { useState, useEffect } from 'react';

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
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  /**
   * Handles logout button click
   */
  const handleLogout = () => {
    // Set the active animation to trigger the effect
    setActiveAnimation('logout');
    
    // Logout after a short delay to show the animation
    setTimeout(() => {
      logout();
      navigate('/login');
      // Reset animation state
      setTimeout(() => {
        setActiveAnimation(null);
      }, 300);
    }, 200);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  // Navigation item click handler with animation
  const handleNavClick = (path: string) => {
    // Set the active animation to trigger the effect
    setActiveAnimation(path);
    
    // Close the drawer if it's open (for mobile)
    if (mobileOpen) {
      setMobileOpen(false);
    }
    
    // Navigate to the page after a short delay to show the animation
    setTimeout(() => {
      navigate(path);
      // Reset animation state
      setTimeout(() => {
        setActiveAnimation(null);
      }, 300);
    }, 200);
  };

  // Add a pulse-scale animation for elements without icons
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-rotate {
        0% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
        50% {
          transform: scale(1.4) rotate(10deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }
      
      @keyframes pulse-scale {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.9;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    '& .MuiSvgIcon-root': {
      animation: activeAnimation === path ? 'pulse-rotate 0.5s ease-in-out' : 'none',
      transition: 'all 0.3s ease'
    }
  });

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Patients', icon: <PersonIcon />, path: '/patients' },
    { text: 'Doctors', icon: <MedicalServicesIcon />, path: '/doctors' },
    { text: 'Examinations', icon: <MonitorHeartIcon />, path: '/examinations' },
    { text: 'Prescriptions', icon: <MedicationIcon />, path: '/prescriptions' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      {/* Dashboard link with special styling */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 1
        }}
      >
        <ListItemButton
          key="Dashboard"
          onClick={() => handleNavClick('/')}
          selected={isCurrentPath('/')}
          sx={{
            backgroundColor: isCurrentPath('/') ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
            },
            borderRadius: 1,
            width: '100%',
            py: 1.5,
            display: 'flex',
            justifyContent: 'center',
            '& .MuiSvgIcon-root': {
              animation: activeAnimation === '/' ? 'pulse-rotate 0.5s ease-in-out' : 'none',
              transition: 'all 0.3s ease',
              fontSize: '2rem',
              mb: 1
            },
            '& .MuiListItemText-root': {
              textAlign: 'center'
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DashboardIcon color={isCurrentPath('/') ? 'primary' : 'inherit'} />
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: isCurrentPath('/') ? 'bold' : 'normal',
                color: isCurrentPath('/') ? theme.palette.primary.main : 'inherit'
              }}
            >
              Dashboard
            </Typography>
          </Box>
        </ListItemButton>
      </Box>
      
      <List>
        {navigationItems
          .filter((item) => item.path !== '/')
          .map((item) => (
          <ListItemButton
            key={item.text} 
            onClick={() => handleNavClick(item.path)}
            selected={isCurrentPath(item.path)}
            sx={{
              backgroundColor: isCurrentPath(item.path) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
              },
              my: 0.5,
              borderRadius: 1,
              mx: 1,
              '& .MuiSvgIcon-root': {
                animation: activeAnimation === item.path ? 'pulse-rotate 0.5s ease-in-out' : 'none',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40, 
              color: isCurrentPath(item.path) ? theme.palette.primary.main : 'inherit'
            }}>
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
          onClick={() => handleNavClick('/')}
          sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
            animation: activeAnimation === '/' ? 'pulse-scale 0.5s ease-in-out' : 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          Medical System
        </Typography>
        
        {isAuthenticated ? (
          <>
            {isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  color="inherit"
                  aria-label="go to dashboard"
                  onClick={() => handleNavClick('/')}
                  sx={{ 
                    mr: 1,
                    '& .MuiSvgIcon-root': {
                      animation: activeAnimation === '/' ? 'pulse-rotate 0.5s ease-in-out' : 'none',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {navigationItems.map((item) => (
                    <Button 
                      key={item.text}
                      color="inherit" 
                      onClick={() => handleNavClick(item.path)}
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
                      '& .MuiSvgIcon-root': {
                        animation: activeAnimation === 'logout' ? 'pulse-rotate 0.5s ease-in-out' : 'none',
                        transition: 'all 0.3s ease'
                      }
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
            onClick={() => {
              setActiveAnimation('login');
              setTimeout(() => {
                navigate('/login');
                setTimeout(() => {
                  setActiveAnimation(null);
                }, 300);
              }, 200);
            }}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
              },
              animation: activeAnimation === 'login' ? 'pulse-scale 0.5s ease-in-out' : 'none',
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
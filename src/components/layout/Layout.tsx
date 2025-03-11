import { Box } from '@mui/material';
import { ReactNode } from 'react';
import Header from './Header/Header';

/**
 * Props for the Layout component
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component for the application
 * Includes the header and main content area
 * 
 * @param children - The main content to display
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#111827'
    }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          px: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ 
          width: '100%', 
          maxWidth: '1400px',
          mx: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 
import { Container, Box, Paper, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the PageContainer component
 */
interface PageContainerProps {
  title: string;
  children: ReactNode;
}

/**
 * PageContainer component for consistent page layout
 * Provides a container with a title and content area
 * 
 * @param title - The page title
 * @param children - The page content
 */
const PageContainer: React.FC<PageContainerProps> = ({ title, children }) => {
  const theme = useTheme();

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Paper 
          sx={{ 
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
              transition: 'box-shadow 0.3s ease-in-out'
            }
          }}
        >
          {children}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PageContainer; 
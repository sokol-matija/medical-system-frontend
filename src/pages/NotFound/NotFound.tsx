import { Button, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound component displayed when a route doesn't match
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography align="center" sx={{ mb: 3 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound; 
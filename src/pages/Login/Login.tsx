import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/axios';
import axios, { AxiosError } from 'axios';
import endpoints from '../../api/endpoints';

/**
 * Interface for API error response structure
 */
interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

/**
 * Login page component
 * Provides a form for users to authenticate
 */
const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Creates a mock JWT token for the admin user
   * This is used for the universal admin login
   * @returns A JWT token string
   */
  const createAdminToken = () => {
    // Create a payload with admin information
    // Note: This is a simplified mock token for frontend use only
    const payload = {
      nameid: 'admin',
      unique_name: 'admin',
      role: 'Administrator',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
    };
    
    // Base64 encode the payload
    const base64Payload = btoa(JSON.stringify(payload));
    
    // Create a simplified token structure (header.payload.signature)
    // Note: This is not a real JWT token, just a simulation for frontend use
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.mockSignature`;
  };

  /**
   * Handles form submission
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    // Check for universal admin login
    if (username === 'admin' && password === 'admin') {
      // Create a mock token for admin
      const adminToken = createAdminToken();
      
      // Update auth context with the admin token
      login(adminToken);
      navigate('/');
      return;
    }
    
    try {
      // Send login request to the API for non-admin users
      const response = await apiClient.post(
        endpoints.login,
        { username, password }
      );
      
      // Extract token from response
      const { token } = response.data;
      
      if (token) {
        // Update auth context with the token
        login(token);
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      // Handle different error types
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 401) {
          setError('Invalid username or password');
        } else {
          setError(axiosError.response?.data?.message || 'An error occurred during login');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Medical System Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
        
        {/* Help text for the universal login */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Universal admin access: username "admin" / password "admin"
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login; 
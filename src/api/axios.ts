import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7200';

/**
 * Axios instance configured for the Medical System API
 * - Sets base URL from environment variables
 * - Adds Content-Type header
 * - Includes request and response interceptors for authentication
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 
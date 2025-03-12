import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7200';

// Only log in development mode
const isDev = import.meta.env.DEV;
if (isDev) {
  console.log('Using API URL:', API_URL);
}

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_URL, // Use the API URL from environment variables
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to each request
api.interceptors.request.use(
  (config) => {
    // Check if the URL already contains /api
    const urlHasApi = config.url?.includes('/api');
    const baseUrlHasApi = config.baseURL?.includes('/api');
    
    // Only add /api prefix if the URL doesn't already contain /api and the baseURL doesn't contain /api
    if (config.url && !urlHasApi && !baseUrlHasApi) {
      config.url = `/api${config.url.startsWith('/') ? config.url : `/${config.url}`}`;
    }
    
    // Enhanced logging only in development
    if (isDev) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: (config.baseURL || '') + (config.url || ''),
        headers: config.headers,
        data: config.data ? JSON.stringify(config.data) : 'No data'
      });
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set appropriate content type for JSON data
    if (!config.headers['Content-Type'] && 
        (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging only in development
    if (isDev) {
      console.error('API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      }
    }
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle authentication errors (token expired, etc.)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
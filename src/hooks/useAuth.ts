import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access the authentication context
 * Provides access to authentication state and functions
 * 
 * @returns Authentication context with isAuthenticated, user, login, and logout
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 
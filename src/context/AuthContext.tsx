import { createContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * User interface representing the authenticated user
 */
interface User {
  id: string;
  username: string;
  role: string;
}

/**
 * Authentication context type definition
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * JWT payload structure for decoding tokens
 */
interface JwtPayload {
  nameid: string;
  unique_name: string;
  role: string;
  exp: number;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

/**
 * Authentication Provider component
 * Manages authentication state and provides login/logout functions
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for authentication status and user info
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if there's a token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token and check expiration
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Token is valid, set authenticated state
          setIsAuthenticated(true);
          setUser({
            id: decoded.nameid,
            username: decoded.unique_name,
            role: decoded.role,
          });
        } else {
          // Token is expired, clear it
          localStorage.removeItem('token');
        }
      } catch {
        // Invalid token, clear it
        localStorage.removeItem('token');
      }
    }
  }, []);

  /**
   * Login function to authenticate a user with a JWT token
   * @param token - The JWT token received from the server
   */
  const login = (token: string) => {
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Decode the token
    const decoded = jwtDecode<JwtPayload>(token);
    
    // Update authentication state
    setIsAuthenticated(true);
    setUser({
      id: decoded.nameid,
      username: decoded.unique_name,
      role: decoded.role,
    });
  };

  /**
   * Logout function to remove authentication
   */
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update authentication state
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 
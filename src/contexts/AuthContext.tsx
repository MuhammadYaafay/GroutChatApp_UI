import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, getAuthUser, removeAuthToken, setAuthToken, User } from '@/utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/utils/apiUtils';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;                    // Current authenticated user
  loading: boolean;                     // Loading state for auth operations
  login: (token: string) => Promise<void>;  // Function to log in a user
  logout: () => Promise<void>;          // Function to log out a user
  refreshUser: () => Promise<void>;     // Function to refresh user data
}

// Create the authentication context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps the application and provides auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for current user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  // Toast notification hook for user feedback
  const { toast } = useToast();

  // Function to refresh user data from the server
  const refreshUser = async () => {
    try {
      const userData = await apiRequest('/api/users/me');
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  // Function to handle user login
  const login = async (token: string) => {
    setAuthToken(token);                // Store the auth token
    await refreshUser();                // Fetch user data
    toast({                            // Show success message
      title: 'Logged in successfully',
      description: 'Welcome back!'
    });
    navigate('/chat');                 // Redirect to chat page
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await removeAuthToken();         // Remove auth token
      setUser(null);                   // Clear user data
      navigate('/login');              // Redirect to login page
      toast({                         // Show success message
        title: 'Logged out',
        description: 'You have been successfully logged out'
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({                         // Show error message
        variant: 'destructive',
        title: 'Logout failed',
        description: 'An error occurred during logout'
      });
    }
  };

  // Effect to check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        await refreshUser();
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Provide auth context to child components
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

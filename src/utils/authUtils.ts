
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  status: 'online' | 'offline' | 'away';
  created_at: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('chatapp-token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('chatapp-token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('chatapp-token');
};

export const getAuthUser = async (): Promise<User | null> => {
  const token = getAuthToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/user`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      removeAuthToken();
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
};

export const logout = async (): Promise<boolean> => {
  const token = getAuthToken();
  
  if (!token) {
    return true;
  }
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'x-auth-token': token
      }
    });
    
    removeAuthToken();
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    removeAuthToken();
    return false;
  }
};

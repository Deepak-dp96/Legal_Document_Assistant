import React, { useEffect, useState, createContext, useContext } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getStoredUser();
        const isAuth = authService.isAuthenticated();

        if (storedUser && isAuth) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearStoredUser();
        // Ensure token is cleared too if user data is corrupted
        localStorage.removeItem('deeplex_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      if (response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        authService.storeUser(response.user);
        // Token is already stored by authService.login
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      setLoading(true);
      setError(null);

      // Cast role to any to satisfy the type requirement, assuming validation happens on backend or form
      const response = await authService.register({
        name,
        email,
        password,
        role: role as any
      });

      if (response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        authService.storeUser(response.user);
        // Token is already stored by authService.register
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    authService.clearStoredUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
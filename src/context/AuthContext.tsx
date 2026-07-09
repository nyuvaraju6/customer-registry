import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; email: string; password?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const toast = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully.');
  }, [toast]);

  // Load token on startup
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!savedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const profile = await api.get('/api/auth/profile');
        setUser(profile);
      } catch (err) {
        console.error('Session expired or invalid:', err);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', res.token);
      
      setToken(res.token);
      setUser(res.user);
      toast.success('Welcome back! Login successful.');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role: 'staff' });
      
      // Auto-login after registration
      sessionStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      toast.success('Registration successful! Welcome aboard.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (data: { name: string; email: string; password?: string }) => {
    try {
      const res = await api.put('/api/auth/profile', data);
      setUser(res.user);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.get('/api/auth/profile');
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

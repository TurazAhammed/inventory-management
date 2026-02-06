import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './api';

export type UserRole = 'inventory_admin' | 'sales_admin' | 'super_admin' | null;

interface AuthContextType {
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on app start: retrieve stored token and role
  const initializeAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRole = await AsyncStorage.getItem('role');

      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }

      if (storedRole) {
        setRole(storedRole as UserRole);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login: send credentials, store token and role
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token: newToken, role: newRole } = res.data;

      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('role', newRole);

      setToken(newToken);
      setRole(newRole as UserRole);

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newRole as UserRole;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Login failed');
    }
  };

  // Logout: clear stored data and state
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      setToken(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, isLoading, login, logout, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

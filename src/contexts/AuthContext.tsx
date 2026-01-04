import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  department?: string;
  matricNumber?: string;
  companyName?: string;
  companyAddress?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: any, role?: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and user on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Verify token validity
      authAPI.verifyToken()
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      let response;

      if (role && role !== 'student') {
        // Role login (supervisor, HOD, coordinator)
        response = await authAPI.roleLogin({ email, password, role });
      } else {
        // Student login
        response = await authAPI.studentLogin({ email, password });
      }

      const { token: authToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any, role?: string) => {
    setIsLoading(true);
    try {
      let response;

      if (role) {
        // Register role (supervisor, HOD, coordinator)
        response = await authAPI.registerRole({
          ...data,
          role: role === 'siwesCoordinator' ? 'coordinator' : role,
        });
      } else {
        // Student registration (requires verification code)
        response = await authAPI.studentSignup(data);
      }

      const { token: authToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      await authAPI.verifyStudentEmail({ email, code });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Verification failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    register,
    verifyEmail,
    logout,
    isLoading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
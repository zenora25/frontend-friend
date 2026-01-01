// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  department?: string;
  matricNumber?: string;
  companyName?: string;
  companyAddress?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: any, role?: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token with backend
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await authAPI.verifyToken();
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      let response;

      if (role && role !== 'student') {
        // Login for supervisors, HOD, coordinator
        response = await authAPI.roleLogin({ email, password, role });
      } else {
        // Student login (no role parameter needed)
        response = await authAPI.studentLogin({ email, password });
      }

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Login failed';
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any, role?: string) => {
    setIsLoading(true);
    try {
      let response;

      if (role && role !== 'student') {
        // Register supervisors, HOD, coordinator
        response = await authAPI.registerRole({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: role,
          department: data.department,
        });
      } else {
        // Student registration (with verification code)
        response = await authAPI.studentSignup({
          fullName: data.fullName,
          email: data.email,
          verificationCode: data.verificationCode,
          password: data.password,
          matricNumber: data.matricNumber,
          department: data.department,
          companyName: data.companyName,
          companyAddress: data.companyAddress,
        });
      }

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Registration failed';
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await authAPI.verifyStudentEmail({ email, code });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || 'Verification failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            token,
            isLoading,
            login,
            register,
            verifyEmail,
            logout,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};
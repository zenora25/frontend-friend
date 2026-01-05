// AuthContext.tsx (FULL FIXED CODE)
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, verificationAPI } from '@/lib/api';

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
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Verify token validity
        authAPI.verifyToken()
            .then(() => {
              console.log('Token verified successfully');
            })
            .catch((error) => {
              console.error('Token verification failed:', error);
              // Token invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            })
            .finally(() => setIsLoading(false));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      console.log('Login attempt:', { email, role: role || 'student' });

      let response;

      if (role && role !== 'student') {
        // Role login (supervisor, HOD, coordinator)
        console.log('Calling roleLogin with:', { email, role });
        response = await authAPI.roleLogin({
          email,
          password,
          role: role // This will be mapped in api.ts
        });
      } else {
        // Student login
        console.log('Calling studentLogin');
        response = await authAPI.studentLogin({ email, password });
      }

      console.log('Login response:', response.data);

      const { token: authToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      console.error('Full login error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('Throwing error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any, role?: string) => {
    setIsLoading(true);
    try {
      console.log('Register attempt:', { email: data.email, role });

      let response;

      if (role) {
        // Register role (supervisor, HOD, coordinator)
        console.log('Calling registerRole with:', {
          ...data,
          role: role === 'siwesCoordinator' ? 'coordinator' : role
        });

        response = await authAPI.registerRole({
          ...data,
          role: role === 'siwesCoordinator' ? 'coordinator' : role,
        });
      } else {
        // Student registration (requires verification code)
        console.log('Calling studentSignup');
        response = await authAPI.studentSignup(data);
      }

      console.log('Register response:', response.data);

      const { token: authToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      console.error('Full registration error:', error);
      console.error('Error response data:', error.response?.data);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      console.log('Verifying email:', { email, code });

      // Convert code to uppercase before sending
      const uppercaseCode = code.toUpperCase();

      // Use the verification endpoint
      const response = await verificationAPI.verifyCode({
        email,
        code: uppercaseCode
      });

      console.log('Verification response:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('Full verification error:', error);
      console.error('Error response data:', error.response?.data);

      // Extract error message from response
      let errorMessage = 'Verification failed';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('Throwing verification error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optional: Redirect to login page
    window.location.href = '/login';
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
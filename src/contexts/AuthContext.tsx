import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, verificationAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  department?: string;
  matricNumber?: string;
  companyName?: string;
  companyAddress?: string;
  lastLogin?: string;
  status?: string;
  progress?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: any, role?: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkToken: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
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

  // Function to refresh user data from API
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Function to check token validity
  const checkToken = async (): Promise<boolean> => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      console.log('No token found in localStorage');
      return false;
    }

    try {
      console.log('Checking token validity...');
      const response = await authAPI.verifyToken();
      console.log('Token verification response:', response.data);

      if (response.data.success) {
        // Token is valid, update user data
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Token verification failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Clear invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }

      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        console.log('Auth initialization:', {
          hasToken: !!savedToken,
          hasUser: !!savedUser
        });

        if (savedToken && savedUser) {
          // Set token immediately for API requests
          setToken(savedToken);

          try {
            // Parse saved user data
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            // Verify token in background
            setTimeout(async () => {
              await checkToken();
            }, 0);

          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: string = 'student') => {
    setIsLoading(true);
    try {
      console.log('Login attempt:', { email, role });

      // Always use roleLogin for all roles including student
      console.log('Calling roleLogin with:', { email, password, role });

      const response = await authAPI.roleLogin({
        email,
        password,
        role
      });

      console.log('Login response:', response.data);

      const { token: authToken, user: userData } = response.data;

      // Validate response structure
      if (!authToken) {
        throw new Error('No token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Login successful for:', userData.email);

    } catch (error: any) {
      console.error('Full login error:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      let errorMessage = 'Login failed. Please check your credentials.';

      // Extract error message from response
      if (error.error) {
        errorMessage = error.error;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account not verified. Please verify your email first.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any, role: string = 'student') => {
    setIsLoading(true);
    try {
      console.log('Register attempt:', { email: data.email, role });

      let response;

      if (role !== 'student') {
        // Register for other roles (supervisor, HOD, coordinator)
        console.log('Registering role:', role);

        // Note: You need to add a registerRole endpoint in your backend
        // or use the existing studentSignup with role parameter
        throw new Error('Role registration not implemented yet');
      } else {
        // Student registration
        console.log('Calling studentSignup with data:', {
          fullName: data.fullName,
          email: data.email,
          verificationCode: data.verificationCode,
          matricNumber: data.matricNumber,
          department: data.department,
          // Don't log password
        });

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

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }

      let errorMessage = 'Registration failed. Please try again.';

      if (error.error) {
        errorMessage = error.error;
      } else if (error.response?.data?.error) {
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

      // Clean inputs
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim().toUpperCase();

      console.log('Sending verification request...');

      // Use the verification endpoint
      const response = await verificationAPI.verifyCode({
        email: cleanEmail,
        code: cleanCode
      });

      console.log('Verification response:', response.data);

      // Return the response data for the registration form
      return response.data;

    } catch (error: any) {
      console.error('Full verification error:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }

      // Extract error message from response
      let errorMessage = 'Verification failed';

      if (error.error) {
        errorMessage = error.error;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login page
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
    isAuthenticated: !!token && !!user,
    checkToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// contexts/AuthContext.tsx
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
  testBackendConnection: () => Promise<boolean>;
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

  // Test backend connection
  const testBackendConnection = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing backend connection...');
      
      // Test health endpoint
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend health check:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      return false;
    }
  };

  // Function to refresh user data from API
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // First test if backend is available
        const isBackendAvailable = await testBackendConnection();
        if (!isBackendAvailable) {
          console.warn('⚠️ Backend server may not be running');
        }

        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        console.log('Auth initialization:', {
          hasToken: !!savedToken,
          hasUser: !!savedUser,
          backendAvailable: isBackendAvailable
        });

        if (savedToken && savedUser) {
          // Set token immediately for API requests
          setToken(savedToken);
          
          try {
            // Parse saved user data
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Verify token in background if backend is available
            if (isBackendAvailable) {
              setTimeout(async () => {
                await checkToken();
              }, 0);
            }
            
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

  // Main login function
  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Login attempt started:', { 
        email, 
        role: role || 'student',
        timestamp: new Date().toISOString() 
      });

      // Clean inputs
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      let response;
      let loginMethod = 'unknown';

      // Determine which endpoint to use
      if (!role || role === 'student') {
        // Try student login endpoint
        loginMethod = 'studentLogin';
        console.log(`🔐 Using ${loginMethod} endpoint`);
        
        try {
          response = await authAPI.studentLogin({ 
            email: cleanEmail, 
            password: cleanPassword 
          });
        } catch (studentLoginError) {
          console.log('❌ Student login failed, trying role login...');
          
          // Fall back to role login
          loginMethod = 'roleLogin (fallback)';
          response = await authAPI.roleLogin({ 
            email: cleanEmail, 
            password: cleanPassword,
            role: 'student'
          });
        }
      } else {
        // Use role login for other roles
        loginMethod = 'roleLogin';
        console.log(`🔐 Using ${loginMethod} endpoint for role: ${role}`);
        
        response = await authAPI.roleLogin({ 
          email: cleanEmail, 
          password: cleanPassword,
          role
        });
      }

      console.log(`✅ ${loginMethod} API response received:`, {
        status: response.status,
        hasData: !!response.data,
        method: loginMethod
      });

      if (!response.data) {
        throw new Error('No response data from server');
      }

      const { token: authToken, user: userData } = response.data;

      // Validate response structure
      if (!authToken) {
        throw new Error('No authentication token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Validate user data structure
      if (!userData.id || !userData.email || !userData.role) {
        console.warn('⚠️ Incomplete user data received:', userData);
        throw new Error('Incomplete user information received');
      }

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('🎉 Login successful!', {
        user: userData.email,
        role: userData.role,
        timestamp: new Date().toISOString()
      });

      return userData;

    } catch (error: any) {
      console.error('🔥 Login process failed:', error);
      
      // Detailed error logging
      if (error.response) {
        // Server responded with error
        console.error('📡 Server error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          url: error.config?.url,
          method: error.config?.method
        });
      } else if (error.request) {
        // Request made but no response
        console.error('🌐 Network error - No response received:', {
          request: error.request,
          message: 'Check if backend server is running on port 5000'
        });
      } else {
        // Other errors
        console.error('🚨 Setup error:', error.message);
      }

      // User-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.error || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = error.response.data?.error || 'Invalid email or password.';
            break;
          case 403:
            errorMessage = error.response.data?.error || 'Account not verified or access denied.';
            break;
          case 404:
            errorMessage = error.response.data?.error || 'User not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            console.error('Server error details:', error.response.data);
            break;
          default:
            errorMessage = error.response.data?.error || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check:\n1. Backend server is running\n2. Port 5000 is available\n3. No CORS issues';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      console.error('📝 Throwing error to UI:', errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Registration function
  const register = async (data: any, role: string = 'student') => {
    setIsLoading(true);
    
    try {
      console.log('📝 Registration attempt:', { 
        email: data.email, 
        role,
        timestamp: new Date().toISOString() 
      });

      let response;

      if (role !== 'student') {
        // Handle other roles if needed
        console.log('⚠️ Non-student registration not fully implemented');
        throw new Error('Registration for this role is not available yet');
      } else {
        // Student registration
        console.log('🎓 Processing student registration...');
        
        // Validate required fields
        const requiredFields = ['fullName', 'email', 'verificationCode', 'password', 'matricNumber', 'department'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        response = await authAPI.studentSignup({
          fullName: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          verificationCode: data.verificationCode.trim().toUpperCase(),
          password: data.password,
          matricNumber: data.matricNumber.trim(),
          department: data.department.trim(),
          companyName: data.companyName?.trim() || '',
          companyAddress: data.companyAddress?.trim() || '',
        });
      }

      console.log('✅ Registration response:', response.data);

      const { token: authToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('🎉 Registration successful!', {
        user: userData.email,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
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

  // Email verification
  const verifyEmail = async (email: string, code: string) => {
    try {
      console.log('🔐 Email verification attempt:', { 
        email,
        codeLength: code.length,
        timestamp: new Date().toISOString() 
      });

      // Clean inputs
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim().toUpperCase();

      console.log('📤 Sending verification request...');

      const response = await verificationAPI.verifyCode({
        email: cleanEmail,
        code: cleanCode
      });

      console.log('✅ Verification response:', response.data);

      return response.data;

    } catch (error: any) {
      console.error('❌ Email verification failed:', error);
      
      let errorMessage = 'Verification failed. Please check the code and try again.';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    console.log('👋 Logging out user:', user?.email);
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('✅ Logout complete');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Context value
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
    testBackendConnection
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
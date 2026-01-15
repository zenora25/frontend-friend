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

  // Function to check token validity
  const checkToken = async (): Promise<boolean> => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return false;

    try {
      await authAPI.verifyToken();
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          // Verify token is still valid
          const isValid = await checkToken();

          if (isValid) {
            setToken(savedToken);
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              // Clear invalid data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } else {
            // Token invalid, clear storage
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
          role: role
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
        console.log('Calling studentSignup with data:', {
          fullName: data.fullName,
          email: data.email,
          verificationCode: data.verificationCode,
          matricNumber: data.matricNumber,
          department: data.department,
          companyName: data.companyName,
          companyAddress: data.companyAddress,
          // password hidden for security
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
      console.log('✅ Verifying email - Email:', email);
      console.log('✅ Verifying email - Code:', code);

      // Clean inputs
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim().toUpperCase();

      console.log('📤 Sending verification request to:', '/verification/verify');
      console.log('📦 Cleaned Email:', cleanEmail);
      console.log('📦 Cleaned Code:', cleanCode);

      // Use the verification endpoint
      const response = await verificationAPI.verifyCode({
        email: cleanEmail,
        code: cleanCode
      });

      console.log('✅ Verification response:', response.data);

      // Return the response data for the registration form
      return response.data;

    } catch (error: any) {
      console.error('❌ Full verification error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);

      // Extract error message from response
      let errorMessage = 'Verification failed';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('❌ Throwing verification error:', errorMessage);
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
    checkToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
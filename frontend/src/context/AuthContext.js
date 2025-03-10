import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if token is expired
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token is expired, try to refresh
          await refreshAccessToken();
        } else {
          // Token is valid, fetch user data
          await fetchUserData(accessToken);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/v1/auth/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };
  
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post('/api/v1/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('accessToken', response.data.access);
      await fetchUserData(response.data.access);
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };
  
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/v1/auth/token/', {
        email,
        password
      });
      
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      await fetchUserData(response.data.access);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    }
  };
  
  const register = async (userData) => {
    setError(null);
    try {
      await axios.post('/api/v1/auth/register/', userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data || 'Registration failed. Please try again.');
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };
  
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.patch('/api/v1/auth/users/me/', profileData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCurrentUser(response.data);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data || 'Failed to update profile. Please try again.');
      return false;
    }
  };
  
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.post('/api/v1/auth/users/change_password/', passwordData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      setError(error.response?.data || 'Failed to change password. Please try again.');
      return false;
    }
  };
  
  // Intercept any 401 responses and try to refresh the token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await authAPI.getProfile();
      setUser(res.data.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setError('Authentication failed. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.register(userData);
      setError(null);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authAPI.login(credentials);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set user data
      setUser(res.data.user);
      setError(null);
      
      return {
        ...res.data,
        tokenStatus: res.data.token ? 'Valid' : 'Missing'
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setUser,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { getErrorMessage, setApiBaseUrl, getApiBaseUrl } from '../services/api';
import { TECHNICIAN_ROLES } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());

  // Logout action
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.error('Error clearing storage:', e);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  // Check stored auth session on app launch
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const storedUrl = await AsyncStorage.getItem('custom_api_url');
      if (storedUrl) {
        setApiBaseUrl(storedUrl);
        setApiUrlState(storedUrl);
      }

      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserJson = await AsyncStorage.getItem('userData');

      if (storedToken) {
        setToken(storedToken);
        if (storedUserJson) {
          try {
            setUser(JSON.parse(storedUserJson));
          } catch (e) {}
        }
        
        // Refresh full user profile from backend
        try {
          const profile = await authService.getProfile();
          if (profile) {
            setUser(profile);
            await AsyncStorage.setItem('userData', JSON.stringify(profile));
          }
        } catch (err) {
          // If token is invalid or expired (401), cleanly clear session and reset to login
          if (err.response?.status === 401) {
            await logout();
          } else {
            console.log('Profile verification check:', getErrorMessage(err));
          }
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login action
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login(email, password);
      if (data && data.token) {
        const userObj = data.user || {};

        // Persist token & basic user
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userObj));

        // Fetch complete profile if possible
        try {
          const profile = await authService.getProfile();
          if (profile) {
            await AsyncStorage.setItem('userData', JSON.stringify(profile));
            setToken(data.token);
            setUser(profile);
            return { success: true, user: profile };
          }
        } catch (e) {}

        setToken(data.token);
        setUser(userObj);
        return { success: true, user: userObj };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Update backend API Base URL
  const updateApiUrl = async (newUrl) => {
    if (!newUrl) return;
    setApiBaseUrl(newUrl);
    setApiUrlState(newUrl);
  };

  const role = user?.role || 'User';
  const isSuperAdmin = role === 'SuperAdmin';
  const isTechnician = TECHNICIAN_ROLES.includes(role);
  const isRegularUser = role === 'User';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isAuthenticated: !!token && !!user,
        authError,
        isSuperAdmin,
        isTechnician,
        isRegularUser,
        login,
        logout,
        checkAuthStatus,
        apiUrl,
        updateApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'https://metro-smart-ticketing-backend.onrender.com/api/auth';
const AUTH_TOKEN_KEY = 'authToken';

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const persistAuth = (nextUser, nextToken = null) => {
    if (nextUser && nextToken) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    setToken(nextUser && nextToken ? nextToken : null);
    setUser(nextUser);
  };

  const authorizedFetch = async (path, options = {}) => {
    const currentToken = getStoredToken();
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  // Initialize from localStorage
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = getStoredToken();

        if (!storedToken) {
          setUser(null);
          return;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Sync user profile with server to validate token and wallet state.
        const me = await authorizedFetch('/me', { method: 'GET' });
        setUser(me.user || null);
        localStorage.setItem('user', JSON.stringify(me.user || null));
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      persistAuth(null, null);
      setError('Session expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const register = async (email, password, fullName) => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      persistAuth(data.user, data.token);

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      console.error('Register error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      persistAuth(data.user, data.token);

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    persistAuth(null, null);
    setError('');
  };

  const refreshUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      return parsed;
    }
    return null;
  };

  const updateUser = (nextUser) => {
    const currentToken = getStoredToken();
    persistAuth(nextUser, currentToken);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    updateUser,
    isAuthenticated: !!user && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication in localStorage
    const storedAuth = localStorage.getItem('whiskit-auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('whiskit-auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Store authentication in localStorage
    localStorage.setItem('whiskit-auth', JSON.stringify({
      user: userData,
      timestamp: Date.now()
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('whiskit-auth');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

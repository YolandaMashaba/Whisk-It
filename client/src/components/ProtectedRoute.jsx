import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(139, 69, 19, 0.2)',
          borderTop: '4px solid #8b4513',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return children;
};

export default ProtectedRoute;

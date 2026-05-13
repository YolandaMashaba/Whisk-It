import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../views/Login';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, login } = useAuth();
    const location = useLocation();

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
        <div
          className="whiskit-auth-spinner"
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(139, 69, 19, 0.2)',
            borderTop: '4px solid #8b4513',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;

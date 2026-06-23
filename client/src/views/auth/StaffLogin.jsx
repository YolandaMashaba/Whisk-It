import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ChefHat } from 'lucide-react';
import { Button, Card } from '@/components/Index';
import { useAuth } from '@/context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const StaffLogin = ({ onLogin }) => {
  const { login, isAuthenticated, user } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const dest = user?.is_admin || user?.role === 'admin' ? '/admin' : '/kitchen';
    return <Navigate to={dest} replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials.username, credentials.password);
      // Login successful - AuthContext will handle the redirect
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
    padding: '20px'
  };

  const loginCardStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '20px',
    boxShadow: '0 20px 25px -5px rgba(139, 69, 19, 0.1), 0 10px 10px -5px rgba(139, 69, 19, 0.04)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(139, 69, 19, 0.1)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const iconContainerStyle = {
    width: '80px',
    height: '80px',
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  };

  const titleStyle = {
    margin: '0 0 8px 0',
    color: '#8b4513',
    fontSize: '28px',
    fontWeight: '800'
  };

  const subtitleStyle = {
    margin: 0,
    color: '#a0826d',
    fontSize: '16px',
    fontWeight: '400'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const inputGroupStyle = {
    position: 'relative'
  };

  const inputIconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0826d',
    pointerEvents: 'none'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '2px solid rgba(212, 165, 116, 0.5)',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: 'rgba(255, 253, 250, 0.8)',
    color: '#8b4513',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#a0826d',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const errorStyle = {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    border: '1px solid rgba(220, 38, 38, 0.2)'
  };

  const demoInfoStyle = {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(212, 165, 116, 0.2)'
  };

  const demoTitleStyle = {
    margin: '0 0 8px 0',
    color: '#8b4513',
    fontSize: '14px',
    fontWeight: '600'
  };

  const demoTextStyle = {
    margin: 0,
    color: '#a0826d',
    fontSize: '13px',
    lineHeight: '1.5'
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <ChefHat size={40} color="#d4a574" />
          </div>
          <h1 style={titleStyle}>Staff Login</h1>
          <p style={subtitleStyle}>Whisk-It Bakery Management</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <User size={20} style={inputIconStyle} />
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b4513';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 165, 116, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={inputGroupStyle}>
            <Lock size={20} style={inputIconStyle} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b4513';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 165, 116, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={passwordToggleStyle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            style={{ 
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="mt-4 text-center text-sm text-[#a0826d]">
                    New here?{' '}
                    <Link to="/register" className="font-semibold text-[#8b4513] underline">
                        Create an account
                    </Link>
                </p>
        </form>

        {/* <div style={demoInfoStyle}>
          <h3 style={demoTitleStyle}>Demo Credentials</h3>
          <p style={demoTextStyle}>
            Username: <strong>staff</strong><br />
            Password: <strong>whiskit123</strong>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default StaffLogin;

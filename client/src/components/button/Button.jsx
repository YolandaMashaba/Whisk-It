import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    textDecoration: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: '#8b4513',
      color: '#FFFFFF',
      border: '2px solid #8b4513',
    },
    secondary: {
      backgroundColor: 'rgba(212, 165, 116, 0.8)',
      color: '#8b4513',
      border: '2px solid rgba(212, 165, 116, 0.9)',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#FFFFFF',
      border: '2px solid #dc2626',
    },
    success: {
      backgroundColor: '#16a34a',
      color: '#FFFFFF',
      border: '2px solid #16a34a',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#8b4513',
      border: '2px solid #8b4513',
    }
  };

  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: '14px',
    },
    medium: {
      padding: '10px 20px',
      fontSize: '16px',
    },
    large: {
      padding: '14px 28px',
      fontSize: '18px',
    }
  };

  const hoverStyles = {
    primary: { backgroundColor: '#a0826d', borderColor: '#a0826d' },
    secondary: { backgroundColor: 'rgba(193, 154, 107, 0.9)', borderColor: 'rgba(193, 154, 107, 1)' },
    danger: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    success: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
    outline: { backgroundColor: 'rgba(212, 165, 116, 0.2)' }
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;
  const currentHover = hoverStyles[variant] || hoverStyles.primary;

  const combinedStyles = {
    ...baseStyles,
    ...currentVariant,
    ...currentSize,
    opacity: disabled || loading ? 0.6 : 1,
    ...props.style,
  };

  return (
    <button
      type={type}
      style={combinedStyles}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.target.style, currentHover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.target.style, combinedStyles);
        }
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

export default Button;

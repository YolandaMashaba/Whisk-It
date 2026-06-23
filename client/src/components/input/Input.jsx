import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value = '', 
  onChange, 
  error = '', 
  disabled = false, 
  required = false,
  className = '',
  noMargin = false,
  ...props 
}) => {
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${error ? '#dc2626' : 'rgba(212, 165, 116, 0.5)'}`,
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: disabled ? 'rgba(245, 245, 245, 0.8)' : 'rgba(255, 253, 250, 0.95)',
    color: '#8b4513',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#8b4513',
    fontSize: '14px',
  };

  const errorStyles = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  };

  const containerStyles = {
    marginBottom: noMargin ? 0 : '16px',
  };

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyles}
        {...props}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = error ? '#dc2626' : '#8b4513';
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220, 38, 38, 0.1)' : 'rgba(139, 69, 19, 0.1)'}`;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#dc2626' : 'rgba(212, 165, 116, 0.5)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export default Input;

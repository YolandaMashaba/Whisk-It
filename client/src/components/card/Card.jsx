import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  variant = 'default', 
  padding = 'medium', 
  className = '',
  ...props 
}) => {
  const baseStyles = {
    backgroundColor: 'rgba(255, 253, 250, 0.95)',
    borderRadius: '16px',
    border: '1px solid rgba(139, 69, 19, 0.1)',
    boxShadow: '0 4px 16px rgba(139, 69, 19, 0.15)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  const variants = {
    default: {},
    elevated: {
      boxShadow: '0 8px 25px rgba(139, 69, 19, 0.2)',
      transform: 'translateY(-4px)',
    },
    outlined: {
      border: '2px solid rgba(212, 165, 116, 0.5)',
      boxShadow: 'none',
    }
  };

  const paddings = {
    none: { padding: '0' },
    small: { padding: '16px' },
    medium: { padding: '24px' },
    large: { padding: '32px' }
  };

  const headerStyles = {
    borderBottom: title ? '1px solid rgba(139, 69, 19, 0.1)' : 'none',
    padding: padding !== 'none' ? '24px 24px 18px' : '16px',
    backgroundColor: 'rgba(255, 253, 250, 0.8)',
  };

  const titleStyles = {
    margin: '0',
    color: '#8b4513',
    fontSize: '18px',
    fontWeight: '700',
  };

  const subtitleStyles = {
    margin: '4px 0 0',
    color: '#a0826d',
    fontSize: '14px',
    fontWeight: '400',
  };

  const bodyStyles =
    padding === 'none' ? paddings.none : (paddings[padding] || paddings.medium);

  const currentVariant = variants[variant] || variants.default;

  const combinedStyles = {
    ...baseStyles,
    ...currentVariant,
    ...props.style,
  };

  return (
    <div style={combinedStyles} className={className} {...props}>
      {(title || subtitle) && (
        <div style={headerStyles}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
      )}
      <div style={bodyStyles}>
        {children}
      </div>
    </div>
  );
};

export default Card;

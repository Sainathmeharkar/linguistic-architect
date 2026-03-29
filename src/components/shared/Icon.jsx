// src/components/shared/Icon.jsx
import React from 'react';

const Icon = ({ 
  name, 
  size = 'md',
  color = 'on-surface-variant',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const colorClasses = {
    'on-surface': 'text-on-surface',
    'on-surface-variant': 'text-on-surface-variant',
    'primary': 'text-primary',
    'secondary': 'text-secondary',
    'tertiary': 'text-tertiary',
    'error': 'text-error'
  };

  return (
    <span 
      className={`material-symbols-outlined ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;

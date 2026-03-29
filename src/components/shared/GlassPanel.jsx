// src/components/shared/GlassPanel.jsx
import React from 'react';

const GlassPanel = ({
  children,
  className = '',
  variant = 'default',
  glow = false,
  ...props
}) => {
  const variants = {
    default:  'glass-panel rounded-2xl',
    elevated: 'bg-surface-container border border-outline-variant/10 shadow-lg shadow-black/5 rounded-2xl',
    floating: 'bg-surface-variant/50 backdrop-blur-2xl border border-primary/10 rounded-2xl',
    inset:    'bg-surface-container-low border border-outline-variant/10 rounded-2xl',
  };

  const glowClass = glow ? 'glow-primary' : '';

  return (
    <div
      className={`p-6 transition-all duration-300 ${variants[variant] ?? variants.default} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;

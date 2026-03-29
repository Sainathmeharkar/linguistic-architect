// src/components/shared/Button.jsx
import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const base = `
    inline-flex items-center justify-center font-semibold font-body
    transition-all duration-200 rounded-xl focus-ring
    disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.97] select-none
  `;

  const variants = {
    primary:   'bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary-fixed shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:brightness-110',
    filled:    'bg-primary text-on-primary-fixed shadow-md shadow-primary/20 hover:brightness-110 hover:shadow-primary/30',
    outlined:  'bg-transparent border border-outline-variant/40 text-on-surface hover:bg-surface-bright hover:border-primary/30',
    ghost:     'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
    secondary: 'bg-secondary-container text-on-secondary hover:brightness-110',
    tertiary:  'bg-tertiary-container text-on-tertiary-container hover:brightness-110',
    danger:    'bg-error/10 text-error border border-error/20 hover:bg-error/20',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

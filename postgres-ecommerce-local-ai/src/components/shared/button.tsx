import { createElement, forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const base = 'rounded px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2';
    const variants = {
      primary: 'bg-accent-primary text-canvas hover:bg-accent-primary/90 focus:ring-accent-primary',
      secondary: 'bg-accent-secondary text-canvas hover:bg-accent-secondary/90 focus:ring-accent-secondary',
      ghost: 'bg-transparent border border-border text-text hover:bg-container focus:ring-border',
    };
    return createElement(
      'button',
      { ref, className: `${base} ${variants[variant]} ${className}`, ...props },
      children
    );
  }
);

Button.displayName = 'Button';

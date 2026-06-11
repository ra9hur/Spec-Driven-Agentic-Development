import { createElement } from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return createElement(
    'div',
    { className: `bg-container border border-border rounded-lg overflow-hidden ${className}` },
    children
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return createElement('div', { className: `p-4 ${className}` }, children);
}

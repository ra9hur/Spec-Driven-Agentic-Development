import { createElement } from 'react';

export default function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return createElement(
    'div',
    { className: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}` },
    children
  );
}

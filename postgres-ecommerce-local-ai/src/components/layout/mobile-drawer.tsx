import { createElement } from 'react';
import Link from 'next/link';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  if (!isOpen) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 z-50 md:hidden' },
    createElement('div', { className: 'absolute inset-0 bg-black/50', onClick: onClose }),
    createElement(
      'div',
      { className: 'absolute top-0 left-0 h-full w-64 bg-container border-r border-border p-6' },
      createElement(
        'div',
        { className: 'flex justify-between items-center mb-8' },
        createElement('span', { className: 'text-text font-bold text-lg' }, 'Menu'),
        createElement('button', { onClick: onClose, className: 'text-text/60 hover:text-text' }, '×')
      ),
      createElement(
        'nav',
        { className: 'space-y-4' },
        [['Home', '/'], ['Shop', '/shop'], ['Cart', '/cart'], ['Account', '/account']].map(([label, href]) =>
          createElement(Link, { key: href, href, onClick: onClose, className: 'block text-text hover:text-accent-primary transition-colors' }, label)
        )
      )
    )
  );
}

import { createElement } from 'react';
import Link from 'next/link';
import { CartNavBadge } from '@/components/layout/cart-nav-badge';

export default function MobileNav() {
  return createElement(
    'nav',
    { className: 'xl:hidden' },
    createElement(
      'div',
      { className: 'fixed top-0 left-0 right-0 bg-container border-b border-border z-40 flex items-center justify-between px-4 h-14' },
      createElement(Link, { href: '/', className: 'text-text font-bold text-lg' }, 'Postgres E-Com'),
      createElement(
        'button',
        { className: 'text-text p-2' },
        createElement('span', { className: 'text-lg' }, '⌕')
      )
    ),
    createElement('div', { className: 'h-14' }),
    createElement(
      'div',
      {
        'data-testid': 'mobile-bottom-nav',
        className: 'xl:!hidden fixed bottom-0 left-0 right-0 bg-container border-t border-border z-40 flex items-center justify-around h-16',
      },
      createElement(
        Link,
        { href: '/', className: 'flex flex-col items-center text-text/60 hover:text-accent-primary transition-colors text-xs' },
        createElement('span', { className: 'text-lg' }, '⌂'),
        createElement('span', {}, 'Home')
      ),
      createElement(
        Link,
        { href: '/search', className: 'flex flex-col items-center text-text/60 hover:text-accent-primary transition-colors text-xs' },
        createElement('span', { className: 'text-lg' }, '⌕'),
        createElement('span', {}, 'Search')
      ),
      createElement(
        CartNavBadge,
        { className: 'flex flex-col items-center text-text/60 hover:text-accent-primary transition-colors text-xs' },
        createElement('span', { className: 'text-lg' }, '☰'),
        createElement('span', {}, 'Cart')
      ),
      createElement(
        Link,
        { href: '/account', className: 'flex flex-col items-center text-text/60 hover:text-accent-primary transition-colors text-xs' },
        createElement('span', { className: 'text-lg' }, '◎'),
        createElement('span', {}, 'Account')
      )
    ),
    createElement('div', { className: 'h-16' })
  );
}

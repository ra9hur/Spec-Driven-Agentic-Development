'use client';
import { createElement, useState } from 'react';
import Link from 'next/link';

export function SidebarToggle({ navLinks }: { navLinks: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return createElement(
    'div',
    { className: 'lg:hidden' },
    createElement(
      'button',
      {
        onClick: () => setOpen(!open),
        className: 'fixed top-4 left-4 z-50 bg-container border border-border rounded p-2 text-text',
        'aria-label': 'Toggle sidebar',
      },
      open ? '✕' : '☰'
    ),
    open && createElement(
      'div',
      {
        className: 'fixed inset-0 z-40 bg-black/50',
        onClick: () => setOpen(false),
      }
    ),
    createElement(
      'div',
      {
        className: `fixed left-0 top-0 h-full w-56 bg-container border-r border-border z-50 p-4 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`,
      },
      createElement(
        'div',
        { className: 'mb-8' },
        createElement('div', { className: 'text-xs font-mono text-accent-primary bg-accent-primary/10 inline-block px-2 py-1 rounded mb-4' }, 'ADMIN'),
        createElement(Link, { href: '/admin', className: 'block text-text font-bold text-lg', onClick: () => setOpen(false) }, 'Admin Panel')
      ),
      createElement(
        'nav',
        { className: 'space-y-1' },
        navLinks.map((link) =>
          createElement(
            Link,
            { key: link.href, href: link.href, onClick: () => setOpen(false), className: 'block px-3 py-2 text-sm text-text/80 hover:text-text hover:bg-canvas rounded transition-colors' },
            link.label
          )
        ),
        createElement('hr', { className: 'my-4 border-border' }),
        createElement(Link, { href: '/', onClick: () => setOpen(false), className: 'block px-3 py-2 text-sm text-text/80 hover:text-text hover:bg-canvas rounded transition-colors' }, '← Back to Store')
      )
    )
  );
}

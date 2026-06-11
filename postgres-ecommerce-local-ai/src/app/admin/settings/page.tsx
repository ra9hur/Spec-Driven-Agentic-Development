import { createElement } from 'react';

export default function AdminSettingsPage() {
  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Settings'),
    createElement('p', { className: 'text-text/60' }, 'System configuration and preferences coming soon.')
  );
}

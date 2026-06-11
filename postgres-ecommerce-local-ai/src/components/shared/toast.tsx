import { createElement } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const colors = {
    success: 'border-accent-primary bg-green-900/20',
    error: 'border-red-500 bg-red-900/20',
    info: 'border-accent-secondary bg-purple-900/20',
  };

  return createElement(
    'div',
    {
      className: `fixed bottom-4 right-4 z-50 ${colors[type]} border rounded-lg p-4 flex items-center gap-3 max-w-md`,
      onClick: onClose,
    },
    createElement('span', { className: 'text-text flex-1' }, message),
    createElement('button', { onClick: onClose, className: 'text-text/60 hover:text-text' }, '×')
  );
}

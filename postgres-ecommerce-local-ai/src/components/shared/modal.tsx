import { createElement, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 z-50 flex items-center justify-center' },
    createElement('div', {
      className: 'absolute inset-0 bg-black/50',
      onClick: onClose,
    }),
    createElement(
      'div',
      { className: 'relative bg-container border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto' },
      title && createElement('h2', { className: 'text-xl font-bold mb-4 text-text' }, title),
      children
    )
  );
}

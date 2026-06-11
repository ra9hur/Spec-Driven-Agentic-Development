'use client';
import { createElement, useCallback, useState } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export function UserGrid({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId?: string;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleRole = useCallback(async (userId: string, makeAdmin: boolean) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: makeAdmin }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update role');
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return createElement(
    'div',
    { className: 'overflow-x-auto' },
    error && createElement('div', { className: 'mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm' }, error),
    createElement(
      'table',
      { className: 'w-full text-left' },
      createElement(
        'thead',
        {},
        createElement(
          'tr',
          { className: 'border-b border-border' },
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'User'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Email'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Role'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Joined'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Actions'),
        )
      ),
      createElement(
        'tbody',
        {},
        users.length === 0
          ? createElement('tr', {},
              createElement('td', { colSpan: 5, className: 'py-8 text-center text-text/60' }, 'No users found')
            )
          : users.map((user) => {
              const isSelf = user.id === currentUserId;
              return createElement(
                'tr',
                { key: user.id, className: 'border-b border-border hover:bg-container/50' },
                createElement('td', { className: 'py-3 px-4 text-text' },
                  user.displayName,
                  isSelf && createElement('span', { className: 'ml-2 text-xs text-text/40' }, '(you)')
                ),
                createElement('td', { className: 'py-3 px-4 text-text/60 text-sm' }, user.email),
                createElement('td', { className: 'py-3 px-4' }, createElement(
                  'span',
                  { className: `text-xs font-medium px-2 py-1 rounded ${user.role === 'admin' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-text/10 text-text/60'}` },
                  user.role
                )),
                createElement('td', { className: 'py-3 px-4 text-text/60 text-sm' }, user.createdAt),
                createElement(
                  'td',
                  { className: 'py-3 px-4' },
                  createElement(
                    'button',
                    {
                      onClick: () => handleToggleRole(user.id, user.role !== 'admin'),
                      disabled: updatingId === user.id || (isSelf && user.role === 'admin'),
                      title: isSelf && user.role === 'admin' ? 'Cannot revoke your own admin privileges' : undefined,
                      className: `px-3 py-1 rounded text-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.role === 'admin'
                          ? 'border-red-500 text-red-500 hover:bg-red-500/10'
                          : 'border-accent-primary text-accent-primary hover:bg-accent-primary/10'
                      }`,
                    },
                    updatingId === user.id
                      ? 'Updating...'
                      : user.role === 'admin'
                        ? isSelf ? 'Self' : 'Revoke Admin'
                        : 'Grant Admin'
                  )
                )
              );
            })
      )
    )
  );
}

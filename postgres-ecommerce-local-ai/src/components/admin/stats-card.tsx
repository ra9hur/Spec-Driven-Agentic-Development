import { createElement } from 'react';
import { Card } from '@/components/shared/card';

export interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ label, value, trend, className = '' }: StatsCardProps) {
  const trendColors = {
    up: 'text-accent-primary',
    down: 'text-red-500',
    neutral: 'text-text/60',
  };

  return createElement(
    Card,
    { className: `p-4 ${className}` },
    createElement('p', { className: 'text-sm text-text/60' }, label),
    createElement('p', { className: `text-2xl font-bold mt-1 ${trend ? trendColors[trend] : 'text-text'}` }, value)
  );
}

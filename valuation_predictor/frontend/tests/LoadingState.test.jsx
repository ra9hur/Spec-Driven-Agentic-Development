import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingState from '../src/components/LoadingState';

describe('LoadingState Component (REQ-28)', () => {
  it('renders spinner with animate-spin class', () => {
    const { container } = render(<LoadingState />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  it('displays "Calculating valuation..." text', () => {
    render(<LoadingState />);
    expect(screen.getByText('Calculating valuation...')).toBeDefined();
  });

  it('uses full-screen overlay with fixed inset-0', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('fixed inset-0');
  });

  it('has bg-primary-bg and bg-opacity-90', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('bg-primary-bg');
    expect(container.innerHTML).toContain('bg-opacity-90');
  });

  it('spinner has border-4 and rounded-full', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('border-4');
    expect(container.innerHTML).toContain('rounded-full');
  });

  it('spinner uses border-t-brand-accent for red accent', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('border-t-brand-accent');
  });

  it('spinner uses border-border-default for base border', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('border-border-default');
  });

  it('loading text uses text-text-muted', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('text-text-muted');
  });

  it('has z-50 for top-layer positioning', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('z-50');
  });

  it('flex layout centers content vertically and horizontally', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('flex items-center justify-center');
  });

  it('spinner is w-12 h-12', () => {
    const { container } = render(<LoadingState />);
    expect(container.innerHTML).toContain('w-12 h-12');
  });
});

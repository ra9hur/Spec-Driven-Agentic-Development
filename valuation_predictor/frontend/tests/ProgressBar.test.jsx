import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../src/components/ProgressBar';

describe('ProgressBar Component', () => {
  it('renders label and percent text', () => {
    render(<ProgressBar label="TEST" percent={50} />);
    expect(screen.getByText('TEST')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('clamps percent to 100% maximum', () => {
    render(<ProgressBar label="OVER" percent={150} />);
    expect(screen.getByText('100%')).toBeDefined();
  });

  it('clamps percent to 0% minimum', () => {
    render(<ProgressBar label="UNDER" percent={-20} />);
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('renders 0% correctly', () => {
    render(<ProgressBar label="ZERO" percent={0} />);
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('renders 100% correctly', () => {
    render(<ProgressBar label="FULL" percent={100} />);
    expect(screen.getByText('100%')).toBeDefined();
  });

  it('fill div has correct width style', () => {
    const { container } = render(<ProgressBar label="WIDTH" percent={75} />);
    const fill = container.querySelector('.h-full.bg-brand-accent');
    expect(fill).toBeDefined();
    expect(fill.style.width).toBe('75%');
  });

  it('track uses bg-border-default and h-3', () => {
    const { container } = render(<ProgressBar label="TRACK" percent={50} />);
    expect(container.innerHTML).toContain('h-3 bg-border-default');
  });

  it('fill uses bg-brand-accent and rounded', () => {
    const { container } = render(<ProgressBar label="FILL" percent={50} />);
    expect(container.innerHTML).toContain('bg-brand-accent rounded');
  });

  it('has transition-all duration-500 for animation', () => {
    const { container } = render(<ProgressBar label="ANIM" percent={50} />);
    expect(container.innerHTML).toContain('transition-all duration-500');
  });

  it('label uses text-text-muted', () => {
    const { container } = render(<ProgressBar label="MUTED" percent={50} />);
    expect(container.innerHTML).toContain('text-text-muted');
  });

  it('percent value uses text-text-primary', () => {
    const { container } = render(<ProgressBar label="PRIMARY" percent={50} />);
    expect(container.innerHTML).toContain('text-text-primary');
  });

  it('handles decimal percent values', () => {
    render(<ProgressBar label="DECIMAL" percent={66.67} />);
    expect(screen.getByText('66.67%')).toBeDefined();
  });

  it('handles exact boundary at 100', () => {
    render(<ProgressBar label="BOUNDARY" percent={100} />);
    expect(screen.getByText('100%')).toBeDefined();
    const { container } = render(<ProgressBar label="BOUNDARY2" percent={100} />);
    const fill = container.querySelector('.h-full.bg-brand-accent');
    expect(fill.style.width).toBe('100%');
  });
});

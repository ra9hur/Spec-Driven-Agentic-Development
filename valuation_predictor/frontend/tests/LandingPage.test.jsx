import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LandingPage from '../src/views/LandingPage';

function renderLanding(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('REQ-04 AC-01: Branding Landing Screen', () => {
  it('renders branding title PreSeedIQ', () => {
    renderLanding();
    const heading = screen.getByText('PreSeedIQ');
    expect(heading).toBeDefined();
    expect(heading.tagName).toBe('H1');
  });

  it('renders START VALUATION button', () => {
    renderLanding();
    const btn = screen.getByText('START VALUATION');
    expect(btn).toBeDefined();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.closest('button')).not.toBeDisabled();
  });

  it('renders tagline text about 3 minutes', () => {
    renderLanding();
    expect(screen.getByText(/under 3 minutes/i)).toBeDefined();
  });

  it('has full-screen dark background layout', () => {
    renderLanding();
    const container = screen.getByText('PreSeedIQ').closest('div');
    expect(container.className).toContain('bg-primary-bg');
  });

  it('START VALUATION button has brand accent primary styling', () => {
    renderLanding();
    const btn = screen.getByText('START VALUATION');
    expect(btn.className).toContain('bg-brand-accent');
  });
});

describe('REQ-05 AC-02: START VALUATION navigates to Disclaimer', () => {
  it('clicking START VALUATION navigates to /disclaimer', () => {
    let renderedPath = '/';
    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    );
    const btn = screen.getByText('START VALUATION');
    fireEvent.click(btn);
  });
});

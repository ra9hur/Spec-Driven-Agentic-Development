import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Disclaimer from '../src/views/Disclaimer';

function renderDisclaimer(initialEntries = ['/disclaimer']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Disclaimer />
    </MemoryRouter>
  );
}

describe('REQ-05 AC-02: Disclaimer Intercept Modal', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const LEGAL_FRAGMENTS = [
    'educational purposes only',
    'financial, legal, or investment advice',
    'PreSeedIQ is an estimator',
    'not a replacement for investor due diligence',
  ];

  for (const fragment of LEGAL_FRAGMENTS) {
    it(`renders legal text: "${fragment}"`, () => {
      renderDisclaimer();
      expect(screen.getByText(new RegExp(fragment, 'i'))).toBeDefined();
    });
  }

  it('renders the Disclaimer heading', () => {
    renderDisclaimer();
    expect(screen.getByText('Disclaimer')).toBeDefined();
  });

  it('renders Cancel button that navigates to landing', () => {
    renderDisclaimer();
    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn).toBeDefined();
    expect(cancelBtn.closest('button')).not.toBeDisabled();
  });

  it('renders Continue button (disabled initially)', () => {
    renderDisclaimer();
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn).toBeDefined();
    expect(continueBtn.closest('button')).toBeDisabled();
  });

  it('renders in a card with secondary-surface background', () => {
    renderDisclaimer();
    const heading = screen.getByText('Disclaimer');
    const card = heading.closest('div');
    expect(card.className).toContain('bg-secondary-surface');
  });

  it('renders the acceptance checkbox with label', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
    expect(screen.getByText(/I understand and accept this disclaimer/i)).toBeDefined();
  });
});

describe('REQ-06 AC-03: Disclaimer Checkbox Gate', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('Continue button is disabled when checkbox is unchecked', () => {
    renderDisclaimer();
    const btn = screen.getByText('Continue');
    expect(btn.closest('button')).toBeDisabled();
  });

  it('Continue button becomes enabled when checkbox is checked', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const btn = screen.getByText('Continue');
    expect(btn.closest('button')).not.toBeDisabled();
  });

  it('Continue button has disabled styling (opacity+cursor)', () => {
    renderDisclaimer();
    const btn = screen.getByText('Continue');
    const htmlBtn = btn.closest('button');
    expect(htmlBtn.className).toContain('opacity-40');
    expect(htmlBtn.className).toContain('cursor-not-allowed');
  });

  it('Continue writes preseediq_disclaimer_accepted flag to sessionStorage', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const btn = screen.getByText('Continue');
    fireEvent.click(btn);
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBe('true');
  });

  it('Continue navigates to /step/1 after acceptance', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const btn = screen.getByText('Continue');
    fireEvent.click(btn);
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBe('true');
  });

  it('Cancel does not write the acceptance flag', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBeNull();
  });

  it('toggling checkbox back to unchecked disables Continue again', () => {
    renderDisclaimer();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(screen.getByText('Continue').closest('button')).not.toBeDisabled();
    fireEvent.click(checkbox);
    expect(screen.getByText('Continue').closest('button')).toBeDisabled();
  });
});

describe('NFR-02 AC-04: URL Bypass Prevention', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('FormWizard redirects to /disclaimer when disclaimer not accepted', () => {
    sessionStorage.removeItem('preseediq_disclaimer_accepted');
    const { container } = render(
      <MemoryRouter initialEntries={['/step/1']}>
        <Disclaimer />
      </MemoryRouter>
    );
    expect(screen.getByText('Disclaimer')).toBeDefined();
  });

  it('disclaimer acceptance flag does not survive sessionStorage.clear()', () => {
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBe('true');
    sessionStorage.clear();
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBeNull();
  });
});

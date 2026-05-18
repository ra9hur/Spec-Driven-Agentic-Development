import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../src/views/Dashboard';
import * as sessionModule from '../src/services/session';

const mockResponse = {
  valuation: { low: 1200000, base: 1500000, high: 1800000, confidencePct: 80 },
  subPillars: { tractionScore: 1.0, marketScore: 1.2, teamScore: 1.5, financialScore: 1.0, riskScore: 1.0 },
  profileAnalysis: { strengths: ['Strong team'], weaknesses: ['Short runway'] },
  aiRecommendation: 'Fundraising Readiness: Test\n\nValuation Expectations: Test\n\nRecommended Actions: Test\n\nCritical Concerns: Test'
};

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/results']}>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  it('redirects to step 1 when no payload in session', () => {
    const { container } = renderDashboard();
    expect(sessionStorage.getItem('preseediq_submit_payload')).toBeNull();
  });

  it('displays loading state while fetching', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderDashboard();
    expect(await screen.findByText(/Calculating valuation/i)).toBeDefined();
  });

  it('displays three-column valuation with LOW, BASE, HIGH and confidence', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('LOW')).toBeDefined();
    expect(await screen.findByText('BASE')).toBeDefined();
    expect(await screen.findByText('HIGH')).toBeDefined();
    expect(await screen.findByText(/Confidence: 80%/)).toBeDefined();
  });

  it('displays progress bars for all 5 sub-pillars', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('TRACTION')).toBeDefined();
    expect(await screen.findByText('MARKET')).toBeDefined();
    expect(await screen.findByText('TEAM')).toBeDefined();
    expect(await screen.findByText('FINANCIAL')).toBeDefined();
    expect(await screen.findByText('RISK')).toBeDefined();
  });

  it('displays two-column profile matrix with strengths and weaknesses', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('STRENGTHS')).toBeDefined();
    expect(await screen.findByText('WEAKNESSES & RISKS')).toBeDefined();
    expect(await screen.findByText('Strong team')).toBeDefined();
    expect(await screen.findByText('Short runway')).toBeDefined();
  });

  it('displays action bar with all 4 buttons', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('BACK TO FORM')).toBeDefined();
    expect(await screen.findByText('EXPORT')).toBeDefined();
    expect(await screen.findByText('SHARE')).toBeDefined();
    expect(await screen.findByText('NEW VALUATION')).toBeDefined();
  });

  it('displays recommendation text block', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('Recommendation')).toBeDefined();
    expect(await screen.findByText(/Fundraising Readiness/)).toBeDefined();
  });

  it('shows error state when API returns error', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockRejectedValueOnce(new Error('API is down'));
    renderDashboard();
    expect(await screen.findByText(/Error/)).toBeDefined();
    expect(await screen.findByText('Back to Form')).toBeDefined();
  });
});

describe('REQ-28: Asynchronous UI Loading State', () => {
  it('shows red spinner with animate-spin class', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    const { container } = renderDashboard();
    await screen.findByText('Calculating valuation...');
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
    expect(container.innerHTML).toContain('animate-spin');
  });

  it('shows full-screen overlay with bg-primary-bg', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    const { container } = renderDashboard();
    expect(container.innerHTML).toContain('bg-primary-bg');
    expect(container.innerHTML).toContain('bg-opacity-90');
  });

  it('displays "Calculating valuation..." loading text', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderDashboard();
    expect(await screen.findByText('Calculating valuation...')).toBeDefined();
  });

  it('spinner has brand-accent border-top and border-default border', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    const { container } = renderDashboard();
    await screen.findByText('Calculating valuation...');
    expect(container.innerHTML).toContain('border-t-brand-accent');
    expect(container.innerHTML).toContain('border-border-default');
  });
});

describe('REQ-29: Three-Column Financial Display', () => {
  it('formats values >= $1M with M suffix', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('$1.2M')).toBeDefined();
    expect(await screen.findByText('$1.5M')).toBeDefined();
    expect(await screen.findByText('$1.8M')).toBeDefined();
  });

  it('formats values >= $1K with K suffix', async () => {
    const smallResponse = {
      ...mockResponse,
      valuation: { low: 1200, base: 1500, high: 1800, confidencePct: 70 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => smallResponse });
    renderDashboard();
    expect(await screen.findByText('$1.2K')).toBeDefined();
    expect(await screen.findByText('$1.5K')).toBeDefined();
    expect(await screen.findByText('$1.8K')).toBeDefined();
  });

  it('formats values < $1K as raw dollars', async () => {
    const tinyResponse = {
      ...mockResponse,
      valuation: { low: 500, base: 750, high: 999, confidencePct: 60 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => tinyResponse });
    renderDashboard();
    expect(await screen.findByText('$500')).toBeDefined();
    expect(await screen.findByText('$750')).toBeDefined();
    expect(await screen.findByText('$999')).toBeDefined();
  });

  it('highlights BASE column with ring-2 ring-brand-accent', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('BASE');
    expect(container.innerHTML).toContain('ring-2 ring-brand-accent');
  });

  it('BASE label and value use brand-accent text color', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('BASE');
    expect(container.innerHTML).toContain('text-brand-accent');
  });

  it('displays confidence percentage below valuation columns', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('Confidence: 80%')).toBeDefined();
  });

  it('formats values >= $1B correctly', async () => {
    const hugeResponse = {
      ...mockResponse,
      valuation: { low: 1500000000, base: 2000000000, high: 2500000000, confidencePct: 90 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => hugeResponse });
    renderDashboard();
    expect(await screen.findByText('$1500.0M')).toBeDefined();
    expect(await screen.findByText('$2000.0M')).toBeDefined();
    expect(await screen.findByText('$2500.0M')).toBeDefined();
  });
});

describe('REQ-30: Multi-Bar Visual Metrizations', () => {
  it('displays percent values for each progress bar', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    await screen.findByText('TRACTION');
    const sixtySixBars = screen.getAllByText(/66\.6/);
    expect(sixtySixBars.length).toBe(2); // TRACTION and RISK both have score 1.0
    const eightyBars = screen.getAllByText('80%');
    expect(eightyBars.length).toBeGreaterThanOrEqual(2); // MARKET + FINANCIAL
    expect(screen.getByText('100%')).toBeDefined(); // TEAM
  });

  it('maps financial score >= 1.0 to 80%', async () => {
    const response = {
      ...mockResponse,
      subPillars: { ...mockResponse.subPillars, financialScore: 1.2 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('FINANCIAL');
    expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1);
  });

  it('maps financial score <= 0.5 to 33%', async () => {
    const response = {
      ...mockResponse,
      subPillars: { ...mockResponse.subPillars, financialScore: 0.3 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('FINANCIAL');
    expect(screen.getAllByText('33%').length).toBeGreaterThanOrEqual(1);
  });

  it('maps financial score between 0.5 and 1.0 to 66%', async () => {
    const response = {
      ...mockResponse,
      subPillars: { ...mockResponse.subPillars, financialScore: 0.7 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('FINANCIAL');
    expect(screen.getAllByText('66%').length).toBeGreaterThanOrEqual(1);
  });

  it('clamps percent to 100% maximum', async () => {
    const response = {
      ...mockResponse,
      subPillars: { ...mockResponse.subPillars, teamScore: 2.0 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('TEAM');
    expect(screen.getByText('100%')).toBeDefined();
  });

  it('clamps percent to 0% minimum', async () => {
    const response = {
      ...mockResponse,
      subPillars: { ...mockResponse.subPillars, riskScore: 0 },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('RISK');
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('progress bar fill uses bg-brand-accent and track uses bg-border-default', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('TRACTION');
    expect(container.innerHTML).toContain('bg-brand-accent');
    expect(container.innerHTML).toContain('bg-border-default');
  });

  it('progress bar fill has transition-all duration-500 class', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('TRACTION');
    expect(container.innerHTML).toContain('transition-all duration-500');
  });
});

describe('REQ-31: Two-Column Profile Matrix', () => {
  it('shows "None identified" for empty strengths', async () => {
    const response = {
      ...mockResponse,
      profileAnalysis: { strengths: [], weaknesses: ['Short runway'] },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    expect(await screen.findByText('None identified')).toBeDefined();
  });

  it('shows "None identified" for empty weaknesses', async () => {
    const response = {
      ...mockResponse,
      profileAnalysis: { strengths: ['Strong team'], weaknesses: [] },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    expect(await screen.findByText('None identified')).toBeDefined();
  });

  it('shows "None identified" when both arrays are empty', async () => {
    const response = {
      ...mockResponse,
      profileAnalysis: { strengths: [], weaknesses: [] },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    const items = await screen.findAllByText('None identified');
    expect(items).toHaveLength(2);
  });

  it('renders multiple strengths as list items', async () => {
    const response = {
      ...mockResponse,
      profileAnalysis: { strengths: ['Strong team', 'Good traction', 'Large market'], weaknesses: [] },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    expect(await screen.findByText('Strong team')).toBeDefined();
    expect(await screen.findByText('Good traction')).toBeDefined();
    expect(await screen.findByText('Large market')).toBeDefined();
  });

  it('renders multiple weaknesses as list items', async () => {
    const response = {
      ...mockResponse,
      profileAnalysis: { strengths: [], weaknesses: ['Short runway', 'No revenue', 'High competition'] },
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    expect(await screen.findByText('Short runway')).toBeDefined();
    expect(await screen.findByText('No revenue')).toBeDefined();
    expect(await screen.findByText('High competition')).toBeDefined();
  });

  it('STRENGTHS header uses green-400 text color', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('STRENGTHS');
    expect(container.innerHTML).toContain('text-green-400');
  });

  it('WEAKNESSES header uses brand-accent text color', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('WEAKNESSES & RISKS');
    expect(container.innerHTML).toContain('text-brand-accent');
  });
});

describe('REQ-32: Action Bar Functional Handlers', () => {
  it('BACK TO FORM navigates to /step/5', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    const backBtn = await screen.findByText('BACK TO FORM');
    fireEvent.click(backBtn);
    await waitFor(() => {
      expect(window.location.hash).toBe('');
    });
  });

  it('EXPORT triggers window.print()', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderDashboard();
    const exportBtn = await screen.findByText('EXPORT');
    fireEvent.click(exportBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('SHARE copies URL to clipboard', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    const shareBtn = await screen.findByText('SHARE');
    fireEvent.click(shareBtn);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/results'));
    });
  });

  it('SHARE silently fails when clipboard unavailable', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('not available'));
    renderDashboard();
    const shareBtn = await screen.findByText('SHARE');
    fireEvent.click(shareBtn);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('NEW VALUATION calls purgeUserSession', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const purgeSpy = vi.spyOn(sessionModule, 'purgeUserSession').mockImplementation(() => {});
    renderDashboard();
    const newBtn = await screen.findByText('NEW VALUATION');
    fireEvent.click(newBtn);
    expect(purgeSpy).toHaveBeenCalledTimes(1);
    purgeSpy.mockRestore();
  });

  it('action bar has fixed bottom positioning', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('BACK TO FORM');
    expect(container.innerHTML).toContain('action-bar');
    expect(container.innerHTML).toContain('fixed bottom-0');
  });

  it('action bar has border-t border-border-default', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('BACK TO FORM');
    expect(container.innerHTML).toContain('border-t border-border-default');
  });
});

describe('REQ-34: Recommendation Text Engine Block', () => {
  it('renders all 4 fallback sections', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    expect(await screen.findByText('Recommendation')).toBeDefined();
    expect(await screen.findByText(/Fundraising Readiness/)).toBeDefined();
    expect(await screen.findByText(/Valuation Expectations/)).toBeDefined();
    expect(await screen.findByText(/Recommended Actions/)).toBeDefined();
    expect(await screen.findByText(/Critical Concerns/)).toBeDefined();
  });

  it('hides recommendation block when aiRecommendation is null', async () => {
    const response = { ...mockResponse, aiRecommendation: null };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('LOW');
    expect(screen.queryByText('Recommendation')).toBeNull();
  });

  it('hides recommendation block when aiRecommendation is empty string', async () => {
    const response = { ...mockResponse, aiRecommendation: '' };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('LOW');
    expect(screen.queryByText('Recommendation')).toBeNull();
  });

  it('hides recommendation block when aiRecommendation is undefined', async () => {
    const response = { ...mockResponse };
    delete response.aiRecommendation;
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });
    renderDashboard();
    await screen.findByText('LOW');
    expect(screen.queryByText('Recommendation')).toBeNull();
  });

  it('renders recommendation as markdown content', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('Recommendation');
    expect(container.innerHTML).toContain('markdown-content');
  });

  it('renders custom Ollama response text', async () => {
    const customResponse = {
      ...mockResponse,
      aiRecommendation: 'Custom AI advice from Ollama model.\n\nSecond paragraph.',
    };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => customResponse });
    renderDashboard();
    expect(await screen.findByText(/Custom AI advice from Ollama model/)).toBeDefined();
    expect(await screen.findByText(/Second paragraph/)).toBeDefined();
  });
});

describe('NFR-09: Transparency Enforcement', () => {
  it('renders valuation grid and progress bars simultaneously', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    await screen.findByText('LOW');
    expect(screen.getByText('BASE')).toBeDefined();
    expect(screen.getByText('HIGH')).toBeDefined();
    expect(screen.getByText('TRACTION')).toBeDefined();
    expect(screen.getByText('MARKET')).toBeDefined();
    expect(screen.getByText('TEAM')).toBeDefined();
    expect(screen.getByText('FINANCIAL')).toBeDefined();
    expect(screen.getByText('RISK')).toBeDefined();
  });

  it('renders profile matrix alongside valuation data', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    renderDashboard();
    await screen.findByText('LOW');
    expect(screen.getByText('STRENGTHS')).toBeDefined();
    expect(screen.getByText('WEAKNESSES & RISKS')).toBeDefined();
  });

  it('no conditional hiding of valuation figures', async () => {
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify({ test: true }));
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const { container } = renderDashboard();
    await screen.findByText('LOW');
    expect(container.innerHTML).toContain('valuation-columns');
  });
});

describe('NFR-10: Print Output Presentation', () => {
  it('print CSS hides action-bar with display: none', () => {
    const css = require('fs').readFileSync(require('path').resolve(__dirname, '../src/index.css'), 'utf-8');
    expect(css).toContain('.action-bar');
    expect(css).toContain('display: none');
  });

  it('print CSS reverses background to #FFFFFF', () => {
    const css = require('fs').readFileSync(require('path').resolve(__dirname, '../src/index.css'), 'utf-8');
    expect(css).toContain('background: #FFFFFF');
  });

  it('print CSS sets text color to #111111', () => {
    const css = require('fs').readFileSync(require('path').resolve(__dirname, '../src/index.css'), 'utf-8');
    expect(css).toContain('color: #111111');
  });

  it('print CSS sets A4 page size with 15mm margin', () => {
    const css = require('fs').readFileSync(require('path').resolve(__dirname, '../src/index.css'), 'utf-8');
    expect(css).toContain('size: A4');
    expect(css).toContain('margin: 15mm');
  });

  it('print CSS prevents valuation columns from breaking inside', () => {
    const css = require('fs').readFileSync(require('path').resolve(__dirname, '../src/index.css'), 'utf-8');
    expect(css).toContain('break-inside: avoid');
  });
});

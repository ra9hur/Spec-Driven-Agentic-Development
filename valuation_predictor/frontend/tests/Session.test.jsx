import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { saveFormData, loadFormData, clearFormData, purgeUserSession } from '../src/services/session';
import FormWizard from '../src/views/FormWizard';
import Dashboard from '../src/views/Dashboard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function renderWizardAtStep(step) {
  return render(
    <MemoryRouter initialEntries={[`/step/${step}`]}>
      <Routes>
        <Route path="/disclaimer" element={<div />} />
        <Route path="/step/:stepId" element={<FormWizard />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/results']}>
      <Dashboard />
    </MemoryRouter>
  );
}

const SAMPLE_FULL_DATA = {
  step1BasicInfo: {
    companyName: 'Acme Inc', countryCode: 'US', industry: 'Tech',
    businessModel: 'B2B', startupStage: 'Idea'
  },
  step2TractionPerformance: {
    monthlyRevenueUSD: 5000, revenueGrowthRatePct: 10, numberOfUsersOrCustomers: 100,
    growthType: 'Month-over-Month', growthRatePct: 5, retentionRatePct: 85
  },
  step3MarketIndustry: {
    estimatedMarketSizeTAM: 50000000, industryGrowthRate: 'High', competitiveIntensity: 'Low'
  },
  step4Team: {
    numberOfFounders: 2, founderBackground: 'Mixed', priorExitsOrRelevantExperience: true
  },
  step5FinancialRisk: {
    burnRateUSDPerMonth: 10000, runwayMonths: 18,
    monetizationClarity: 'Clear/Validated', regulatoryOrExecutionRisk: 'Low'
  },
};

describe('REQ-02 AC-01: Form Persistence Across Steps', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves and loads complete multi-step form data', () => {
    saveFormData(SAMPLE_FULL_DATA);
    const loaded = loadFormData();
    expect(loaded).toEqual(SAMPLE_FULL_DATA);
  });

  it('navigating forward/backward preserves form data in sessionStorage', () => {
    saveFormData({ step1BasicInfo: { companyName: 'TestCo', countryCode: 'US' } });

    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    renderWizardAtStep(1);

    const stored = JSON.parse(sessionStorage.getItem('preseediq_form_data'));
    expect(stored.step1BasicInfo.companyName).toBe('TestCo');
  });

  it('loads saved data when remounting wizard after navigation', () => {
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    saveFormData({ step1BasicInfo: { companyName: 'PreservedCo' } });

    renderWizardAtStep(2);
    const stored = loadFormData();
    expect(stored.step1BasicInfo.companyName).toBe('PreservedCo');
  });

  it('returns null when no data has been saved (empty sessionStorage)', () => {
    expect(loadFormData()).toBeNull();
  });

  it('handles corrupted JSON gracefully by returning null', () => {
    sessionStorage.setItem('preseediq_form_data', '{broken json!!!');
    const loaded = loadFormData();
    expect(loaded).toBeNull();
  });

  it('handles empty object data correctly', () => {
    saveFormData({});
    const loaded = loadFormData();
    expect(loaded).toEqual({});
  });

  it('overwrites existing data on subsequent save', () => {
    saveFormData({ step1BasicInfo: { companyName: 'OldName' } });
    saveFormData({ step1BasicInfo: { companyName: 'NewName' } });
    const loaded = loadFormData();
    expect(loaded.step1BasicInfo.companyName).toBe('NewName');
  });

  it('persists partial (single-step) data', () => {
    saveFormData({ step3MarketIndustry: { estimatedMarketSizeTAM: 1000000 } });
    const loaded = loadFormData();
    expect(loaded.step3MarketIndustry.estimatedMarketSizeTAM).toBe(1000000);
    expect(loaded.step1BasicInfo).toBeUndefined();
  });

  it('stores preseediq_submit_payload when Step5Financial submits', () => {
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    saveFormData(SAMPLE_FULL_DATA);

    renderWizardAtStep(5);
    expect(screen.getByText('CALCULATE VALUATION')).toBeDefined();

    const submitPayload = sessionStorage.getItem('preseediq_submit_payload');
    if (submitPayload) {
      const parsed = JSON.parse(submitPayload);
      expect(parsed.step1BasicInfo).toBeDefined();
      expect(parsed.step5FinancialRisk).toBeDefined();
    }
  });

  it('stores preseediq_submit_payload key with correct name', () => {
    const payload = { step1BasicInfo: {} };
    sessionStorage.setItem('preseediq_submit_payload', JSON.stringify(payload));
    const stored = sessionStorage.getItem('preseediq_submit_payload');
    expect(stored).toBe(JSON.stringify(payload));
  });
});

describe('REQ-03 AC-02: Session Boundary Discard (Data Discard Protocol)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('clearFormData removes the form data key', () => {
    saveFormData({ step1BasicInfo: { companyName: 'TestCo' } });
    expect(loadFormData()).not.toBeNull();
    clearFormData();
    expect(loadFormData()).toBeNull();
  });

  it('clearFormData does not affect other session keys', () => {
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    saveFormData({ step1BasicInfo: { companyName: 'TestCo' } });
    clearFormData();
    expect(sessionStorage.getItem('preseediq_disclaimer_accepted')).toBe('true');
    expect(loadFormData()).toBeNull();
  });

  it('purgeUserSession clears ALL preseediq_* keys from sessionStorage', () => {
    sessionStorage.setItem('preseediq_form_data', '{"test":"value"}');
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    sessionStorage.setItem('preseediq_submit_payload', '{"test":"payload"}');
    expect(sessionStorage.length).toBe(3);

    purgeUserSession();
    expect(sessionStorage.length).toBe(0);
  });

  it('purgeUserSession sets window.location.href to /step/1', () => {
    const originalLocation = { ...window.location };
    let assignedHref = null;
    const locationSpy = {
      ...originalLocation,
      set href(val) { assignedHref = val; },
      get href() { return assignedHref || originalLocation.href; },
    };
    Object.defineProperty(window, 'location', {
      value: locationSpy,
      writable: true,
    });

    sessionStorage.setItem('preseediq_form_data', '{"test":"value"}');
    expect(sessionStorage.length).toBe(1);

    purgeUserSession();
    expect(sessionStorage.length).toBe(0);
    expect(assignedHref).toBe('/step/1');
  });

  it('page refresh simulation wipes all data', () => {
    saveFormData(SAMPLE_FULL_DATA);
    sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
    expect(sessionStorage.length).toBeGreaterThan(0);

    sessionStorage.clear();
    expect(sessionStorage.length).toBe(0);
    expect(loadFormData()).toBeNull();
  });

  it('closing and reopening session (clear) makes loadFormData return null', () => {
    saveFormData(SAMPLE_FULL_DATA);
    sessionStorage.clear();
    expect(loadFormData()).toBeNull();
  });

  it('NEW VALUATION button on Dashboard calls purgeUserSession', () => {
    const payload = JSON.stringify({ step1BasicInfo: { companyName: 'TestCo' } });
    sessionStorage.setItem('preseediq_submit_payload', payload);

    const mockFetch = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valuation: { low: 1000000, base: 1250000, high: 1500000, confidencePct: 80 },
        subPillars: { tractionScore: 1.0, marketScore: 1.2, teamScore: 1.3, financialScore: 1.0, riskScore: 1.0 },
        profileAnalysis: { strengths: ['test'], weaknesses: ['test'] },
        aiRecommendation: 'test'
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    renderDashboard();
    vi.unstubAllGlobals();
  });
});

describe('NFR-01 AC-03: Backend Statelessness', () => {
  const BACKEND_SRC = resolve(__dirname, '../../backend/src');

  it('main.py has no database or caching imports', () => {
    const content = readFileSync(resolve(BACKEND_SRC, 'main.py'), 'utf-8');
    const forbidden = ['sqlite', 'postgres', 'redis', 'mongo', 'shelve', 'dbm', 'open(', 'database', 'cache'];
    for (const term of forbidden) {
      expect(content).not.toContain(term);
    }
  });

  it('engine.py has no file I/O or database references', () => {
    const content = readFileSync(resolve(BACKEND_SRC, 'engine.py'), 'utf-8');
    const forbidden = ['sqlite', 'postgres', 'redis', 'mongo', 'shelve', 'dbm', 'open(', '.write', '.save', 'Path('];
    for (const term of forbidden) {
      expect(content).not.toContain(term);
    }
  });

  it('schemas.py has no runtime state or persistence', () => {
    const content = readFileSync(resolve(BACKEND_SRC, 'schemas.py'), 'utf-8');
    const forbidden = ['open(', 'sqlite', 'redis', 'mongo', 'dbm', 'database', 'cache', '.save', '.write'];
    for (const term of forbidden) {
      expect(content).not.toContain(term);
    }
  });

  it('engine.py is pure math with no database or file side effects', () => {
    const content = readFileSync(resolve(BACKEND_SRC, 'engine.py'), 'utf-8');
    expect(content).toContain('def calculate_valuation');
    const dbTerms = ['sqlite', 'postgres', 'redis', 'mongo', 'shelve', 'dbm'];
    for (const term of dbTerms) {
      expect(content).not.toContain(term);
    }
  });

  it('no middleware for caching or DB sessions in main.py', () => {
    const content = readFileSync(resolve(BACKEND_SRC, 'main.py'), 'utf-8');
    expect(content).toContain('CORSMiddleware');
    expect(content).not.toContain('SessionMiddleware');
    expect(content).not.toContain('SQLAlchemy');
    expect(content).not.toContain('redis');
  });
});

describe('REQ-02/03 AC-04: Key Namespace Isolation', () => {
  const FRONTEND_SRC = resolve(__dirname, '../src');

  it('all sessionStorage.setItem calls use preseediq_ prefix', () => {
    const result = execSync(
      `grep -rn 'sessionStorage\\.setItem' ${FRONTEND_SRC} --include="*.js" --include="*.jsx" || true`,
      { encoding: 'utf-8' }
    );

    const lines = result.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/sessionStorage\.setItem\(['"]([^'"]+)['"]/);
      if (match) {
        expect(match[1]).toMatch(/^preseediq_/);
      }
    }
  });

  it('all sessionStorage.getItem calls use preseediq_ prefix', () => {
    const result = execSync(
      `grep -rn 'sessionStorage\\.getItem' ${FRONTEND_SRC} --include="*.js" --include="*.jsx" || true`,
      { encoding: 'utf-8' }
    );

    const lines = result.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/sessionStorage\.getItem\(['"]([^'"]+)['"]/);
      if (match) {
        expect(match[1]).toMatch(/^preseediq_/);
      }
    }
  });

  it('no localStorage usage in the entire frontend source', () => {
    const result = execSync(
      `grep -rn 'localStorage' ${FRONTEND_SRC} --include="*.js" --include="*.jsx" || true`,
      { encoding: 'utf-8' }
    );
    expect(result.trim()).toBe('');
  });

  it('sessionStorage.clear() is only called from purgeUserSession context', () => {
    const result = execSync(
      `grep -rn 'sessionStorage\\.clear' ${FRONTEND_SRC} --include="*.js" --include="*.jsx" || true`,
      { encoding: 'utf-8' }
    );

    const lines = result.split('\n').filter(l => l.trim());
    expect(lines.length).toBeGreaterThanOrEqual(1);
    for (const line of lines) {
      const filePath = line.split(':')[0];
      const content = readFileSync(filePath, 'utf-8');
      const purgeFunc = content.match(/export\s+function\s+purgeUserSession[\s\S]*?\}/);
      expect(purgeFunc).not.toBeNull();
      expect(purgeFunc[0]).toContain('sessionStorage.clear()');
    }
  });
});

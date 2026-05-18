import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindConfig from '../tailwind.config.js';
import FormInput from '../src/components/FormInput';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getIndexCss() {
  return readFileSync(resolve(__dirname, '../src/index.css'), 'utf-8');
}

describe('REQ-01 AC-02: Token Uniqueness', () => {
  const expectedTokens = {
    'primary-bg': '#0A0A0A',
    'secondary-surface': '#161616',
    'brand-accent': '#E50914',
    'muted-highlight': '#9B050C',
    'border-default': '#262626',
    'text-primary': '#F5F5F7',
    'text-muted': '#A1A1AA',
  };
  const expectedShadows = {
    'accent-glow': '0 0 8px rgba(229, 9, 20, 0.4)',
  };

  const colors = tailwindConfig.theme.extend.colors;
  const shadows = tailwindConfig.theme.extend.boxShadow;

  for (const [key, hex] of Object.entries(expectedTokens)) {
    it(`defines color token '${key}' as ${hex}`, () => {
      expect(colors).toHaveProperty(key);
      expect(colors[key]).toBe(hex);
    });
  }

  it('has exactly 7 unique color tokens', () => {
    const keys = Object.keys(colors);
    expect(keys).toHaveLength(7);
    expect(new Set(keys).size).toBe(7);
  });

  for (const [key, value] of Object.entries(expectedShadows)) {
    it(`defines boxShadow token '${key}'`, () => {
      expect(shadows).toHaveProperty(key);
      expect(shadows[key]).toBe(value);
    });
  }
});

describe('REQ-01 AC-03: Focus & Interact States (REQ-33)', () => {
  it('text input has focus classes', () => {
    render(<FormInput label="Test Input" value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('focus:border-brand-accent');
    expect(input.className).toContain('focus:shadow-accent-glow');
    expect(input.className).toContain('transition-all');
  });

  it('applies disabled styling to text input', () => {
    render(<FormInput label="Test Input" value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('disabled:opacity-40');
    expect(input.className).toContain('disabled:cursor-not-allowed');
    expect(input.disabled).toBe(true);
  });

  it('select dropdown has focus and disabled classes', () => {
    render(
      <FormInput
        label="Dropdown"
        type="dropdown"
        value=""
        onChange={() => {}}
        options={['A', 'B']}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select.className).toContain('focus:border-brand-accent');
    expect(select.className).toContain('focus:shadow-accent-glow');
    expect(select.className).toContain('disabled:opacity-40');
    expect(select.className).toContain('disabled:cursor-not-allowed');
  });

  it('spinner input has focus and disabled classes', () => {
    render(<FormInput label="Spinner" type="spinner" value={1} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    expect(input.className).toContain('focus:border-brand-accent');
    expect(input.className).toContain('focus:shadow-accent-glow');
    expect(input.className).toContain('disabled:opacity-40');
    expect(input.className).toContain('disabled:cursor-not-allowed');
  });

  it('checkbox has disabled opacity class', () => {
    render(<FormInput label="Check me" type="checkbox" value={false} onChange={() => {}} disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('disabled:opacity-40');
    expect(checkbox.disabled).toBe(true);
  });
});

describe('REQ-01 AC-04: Print Styles (NFR-10)', () => {
  it('index.css contains @media print block', () => {
    const css = getIndexCss();
    expect(css).toContain('@media print');
  });

  it('print media query inverts background to #FFFFFF', () => {
    const css = getIndexCss();
    expect(css).toContain('background: #FFFFFF');
  });

  it('print media query sets text to #111111', () => {
    const css = getIndexCss();
    expect(css).toContain('color: #111111');
  });

  it('print media query hides action-bar elements', () => {
    const css = getIndexCss();
    expect(css).toContain('action-bar');
    expect(css).toContain('display: none');
  });

  it('print media query sets A4 page size', () => {
    const css = getIndexCss();
    expect(css).toContain('size: A4');
  });
});

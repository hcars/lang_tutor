import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';

describe('LanguageSelector', () => {
  const defaultProps = {
    value: 'en_US',
    onChange: vi.fn()
  };

  it('should render with correct aria-label', () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.getByLabelText('Select language')).toBeInTheDocument();
  });

  it('should display current language', () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.getByText('English (US)')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<LanguageSelector {...defaultProps} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should have combobox role', () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

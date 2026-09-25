import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrammarPanel } from './GrammarPanel';

describe('GrammarPanel', () => {
  const defaultProps = {
    language: 'en_US',
    onLanguageChange: vi.fn()
  };

  it('renders with the correct container id', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(document.getElementById('grammar-panel')).toBeInTheDocument();
  });

  it('has the correct aria-label', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(screen.getByLabelText('Grammar Panel')).toBeInTheDocument();
  });

  it('displays the panel title', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(screen.getByText('Grammar Panel')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(screen.getByText('Grammar feedback will appear here.')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(screen.getByLabelText('Select language')).toBeInTheDocument();
  });

  it('displays current language in selector', () => {
    render(<GrammarPanel {...defaultProps} />);
    expect(screen.getByText('English (US)')).toBeInTheDocument();
  });
});

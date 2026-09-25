import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorrectionTooltip } from './CorrectionTooltip';

describe('CorrectionTooltip', () => {
  const defaultProps = {
    word: 'helo',
    suggestions: ['hello', 'help', 'hero'],
    position: { x: 100, y: 100 },
    onSelectSuggestion: () => {},
    onClose: () => {}
  };

  it('should render with correct role', () => {
    render(<CorrectionTooltip {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display the misspelled word', () => {
    render(<CorrectionTooltip {...defaultProps} />);
    expect(screen.getByText(/Suggestions for "helo"/)).toBeInTheDocument();
  });

  it('should display all suggestions', () => {
    render(<CorrectionTooltip {...defaultProps} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.getByText('hero')).toBeInTheDocument();
  });

  it('should not render when no suggestions', () => {
    const { container } = render(
      <CorrectionTooltip {...defaultProps} suggestions={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should position correctly', () => {
    render(<CorrectionTooltip {...defaultProps} />);
    const tooltip = screen.getByRole('dialog');
    expect(tooltip).toHaveStyle({ left: '100px', top: '100px' });
  });

  it('should have correct aria-label', () => {
    render(<CorrectionTooltip {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Correction suggestions');
  });
});

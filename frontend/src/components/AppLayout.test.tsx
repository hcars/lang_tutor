import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders all three panes', () => {
    render(<AppLayout />);
    expect(document.getElementById('text-area')).toBeInTheDocument();
    expect(document.getElementById('grammar-panel')).toBeInTheDocument();
    expect(document.getElementById('current-word-panel')).toBeInTheDocument();
  });

  it('has the correct aria-label on the layout region', () => {
    render(<AppLayout />);
    expect(screen.getByRole('region', { name: 'Application layout' })).toBeInTheDocument();
  });

  it('renders the TextArea pane with correct aria-label', () => {
    render(<AppLayout />);
    expect(screen.getByLabelText('Text Area')).toBeInTheDocument();
  });

  it('renders the GrammarPanel pane with correct aria-label', () => {
    render(<AppLayout />);
    expect(screen.getByLabelText('Grammar Panel')).toBeInTheDocument();
  });

  it('renders the CurrentWordPanel pane with correct aria-label', () => {
    render(<AppLayout />);
    expect(screen.getByLabelText('Current Word Panel')).toBeInTheDocument();
  });

  it('renders language selector in grammar panel', () => {
    render(<AppLayout />);
    expect(screen.getByLabelText('Select language')).toBeInTheDocument();
  });
});

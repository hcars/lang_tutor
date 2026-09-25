import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders with the correct container id', () => {
    render(<TextArea />);
    expect(document.getElementById('text-area')).toBeInTheDocument();
  });

  it('has the correct aria-label', () => {
    render(<TextArea />);
    expect(screen.getByLabelText('Text Area')).toBeInTheDocument();
  });

  it('renders a textarea element', () => {
    render(<TextArea />);
    expect(screen.getByLabelText('Text editor')).toBeInTheDocument();
  });

  it('displays the panel title', () => {
    render(<TextArea />);
    expect(screen.getByText('Text Area')).toBeInTheDocument();
  });

  it('allows typing text', async () => {
    const user = userEvent.setup();
    render(<TextArea />);
    
    const textarea = screen.getByLabelText('Text editor');
    await user.type(textarea, 'hello world');
    
    expect(textarea).toHaveValue('hello world');
  });

  it('disables browser spellcheck', () => {
    render(<TextArea />);
    const textarea = screen.getByLabelText('Text editor');
    expect(textarea).toHaveAttribute('spellCheck', 'false');
  });

  it('has overlay for displaying underlines', () => {
    const { container } = render(<TextArea />);
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });
});

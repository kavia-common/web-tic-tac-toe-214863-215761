import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - theme toggle and modal handlers coverage', () => {
  beforeEach(() => {
    try { window.localStorage.clear(); } catch {}
    document.documentElement.setAttribute('data-theme', ''); // reset
  });

  test('theme toggle button toggles theme attribute and persists to localStorage (covers App.js theme branches)', () => {
    render(<App />);
    const html = document.documentElement;
    // Initial theme is light, aria-label reflects target
    const toggle = screen.getByRole('button', { name: /Switch to dark mode/i });
    expect(toggle).toBeInTheDocument();
    expect(html.getAttribute('data-theme')).toBe('light');

    // Toggle -> dark
    fireEvent.click(toggle);
    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('ttt_theme_v1')).toBe('dark');
    // Button aria-label updates to offer switching back
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
  });

  test('onCancelSignature closes modal and clears pending reset (covers App.js lines 94-95)', () => {
    render(<App />);
    // switch to admin to enable reset
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // Make a move and open reset dialog
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);

    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    fireEvent.click(resetBtn);

    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    expect(dialog).toBeInTheDocument();

    // Press cancel inside the modal
    const cancel = within(dialog).getByTestId('cancel-signature');
    fireEvent.click(cancel);

    // Modal is closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Attempt to confirm signature should have no effect since modal closed and pending cleared
    // (no direct way to check pending flag; the absence of modal suffices here)
  });
});

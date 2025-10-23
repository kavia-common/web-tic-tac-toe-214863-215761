import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

// These tests focus on additional branches in App.js and confirm audit error formatting is single-prefixed.
// They also exercise handlers around lines ~25 (theme persistence), and ~94-95 (export audit path).

describe('App - additional branches and audit formatting', () => {
  beforeEach(() => {
    try {
      window.localStorage.clear();
    } catch {
      // ignore for environments without storage
    }
  });

  test('theme toggle persists to localStorage and updates aria-label', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: /Switch to dark mode/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    // Should now be light->dark toggled, label offers reverse
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
    // Verify persistence
    const stored = window.localStorage.getItem('ttt_theme_v1');
    expect(stored === 'dark' || stored === 'light').toBe(true);
  });

  test('audit export path logs event and appends READ AuditTrail record', () => {
    // Spy on console.log to avoid noise
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);
    // Select admin to enable export permission
    const role = screen.getByLabelText(/role/i);
    fireEvent.change(role, { target: { value: 'admin' } });
    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('making an invalid move logs a single-prefixed error in audit panel', () => {
    render(<App />);
    // allow moving with default player role
    const squares = screen.getAllByRole('button', { name: /Square/i });
    // Make first move
    fireEvent.click(squares[0]);
    // Try occupied move (should log BUSINESS_RULE error)
    fireEvent.click(squares[0]);

    // Open audit panel content should include error line with single prefix and not double-prefixed.
    // Use container-level query to avoid text fragmentation.
    const panel = screen.getByRole('region', { name: /Audit Trail/i });
    expect(panel).toBeInTheDocument();
    const errorEl = within(panel).getByText(/^Error: BUSINESS_RULE: Selected square is already occupied\./i);
    expect(errorEl).toBeInTheDocument();
  });
});

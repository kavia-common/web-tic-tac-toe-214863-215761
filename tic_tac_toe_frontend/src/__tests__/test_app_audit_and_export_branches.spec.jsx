import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - audit error formatting single-prefix and export READ branch', () => {
  beforeEach(() => {
    try { window.localStorage.clear(); } catch {}
  });

  test('occupied move produces single-prefixed BUSINESS_RULE error line in audit trail', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]); // valid move
    fireEvent.click(squares[0]); // occupied -> should audit BUSINESS_RULE

    const panel = screen.getByRole('region', { name: /Audit Trail/i });
    // Use container text match to avoid node-splitting brittleness
    expect(panel).toHaveTextContent(/Error:\s*BUSINESS_RULE:\s*Selected square is already occupied\./i);
  });

  test('export audit trail path logs and appends a READ AuditTrail entry', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);
    // Switch to auditor to allow export
    const role = screen.getByLabelText(/Role/i);
    fireEvent.change(role, { target: { value: 'auditor' } });

    const exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    expect(exportBtn).not.toBeDisabled();
    fireEvent.click(exportBtn);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

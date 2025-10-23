import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { AuditTrailProvider } from '../state/AuditContext';

describe('App - additional lines coverage (theme toggle, export, role select)', () => {
  test('toggles theme button text and sets data-theme attribute', () => {
    render(
      <AuditTrailProvider>
        <App />
      </AuditTrailProvider>
    );
    const toggle = screen.getByRole('button', { name: /Switch to dark mode/i });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('export audit branch adds READ event and panel shows content', () => {
    render(
      <AuditTrailProvider>
        <App />
      </AuditTrailProvider>
    );
    const region = screen.getByRole('region', { name: /Audit Trail/i });

    // switch to admin to allow export
    const roleSelect = screen.getByLabelText(/Select user role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    const exportBtn = screen.getByRole('button', { name: /Export Audit/i });
    fireEvent.click(exportBtn);

    expect(region).toHaveTextContent(/Export audit trail/i);
  });

  test('jump and reset handlers use permissions and signature modal flows', () => {
    render(
      <AuditTrailProvider>
        <App />
      </AuditTrailProvider>
    );

    // make a move to have history
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);

    // open reset (requires role)
    const roleSelect = screen.getByLabelText(/Select user role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    const resetBtn = screen.getByRole('button', { name: /Reset Game/i });
    fireEvent.click(resetBtn);

    const dialog = screen.getByTestId('signature-modal');
    const withinDialog = within(dialog);
    fireEvent.change(withinDialog.getByTestId('signature-input'), { target: { value: 'sig' } });
    fireEvent.change(withinDialog.getByTestId('reason-input'), { target: { value: 'because' } });
    fireEvent.click(withinDialog.getByTestId('confirm-signature'));
    // after confirm, modal closes
    expect(screen.queryByTestId('signature-modal')).toBeNull();
  });
});

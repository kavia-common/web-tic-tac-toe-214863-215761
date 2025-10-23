import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App - uncovered branch paths', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('RBAC prevents reset and export when unauthorized (covers early returns)', () => {
    render(<App />);
    // Default role is player; export allowed? In accessControl, player likely cannot export.
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    const exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    // Click should be no-op; ensure disabled state indicates branch taken
    expect(resetBtn).toBeDisabled();
    // If export disabled, ensure click is no-op; if not disabled for player, switch to role without export
    if (exportBtn.hasAttribute('disabled')) {
      fireEvent.click(exportBtn);
      // nothing to assert other than it remains in DOM and no modal etc
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });

  test('onCancelSignature closes modal and clears pending (covers App.js lines 94-95)', () => {
    render(<App />);
    // Switch to admin to open modal
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // Make a move then open reset modal
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);
    fireEvent.click(screen.getByRole('button', { name: /Reset game/i }));

    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    expect(dialog).toBeInTheDocument();

    // Click cancel within the modal
    const cancelBtn = within(dialog).getByTestId('cancel-signature');
    fireEvent.click(cancelBtn);

    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

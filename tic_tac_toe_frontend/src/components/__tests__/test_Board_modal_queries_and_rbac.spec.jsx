import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import App from '../../App';

// This spec focuses on modal query scoping and RBAC defaults in the provider/wrappers.

describe('Board modal queries and RBAC defaults', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('signature modal queries are scoped within the active dialog', () => {
    render(<App />);

    // Switch to admin to enable reset action (opens signature modal)
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // Make a move to ensure non-empty state, so reset has an effect
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);

    // Open reset signature modal
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    fireEvent.click(resetBtn);

    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    expect(dialog).toBeInTheDocument();

    // Scoped queries within the dialog to prevent ambiguity
    const sigInput = within(dialog).getByTestId('signature-input');
    const reasonInput = within(dialog).getByTestId('reason-input');
    const confirmBtn = within(dialog).getByTestId('confirm-signature');

    // Attempt invalid submit to show validation error
    fireEvent.click(confirmBtn);
    const alert = within(dialog).getByTestId('signature-error');
    expect(alert).toHaveTextContent(/Signature required/i);

    // Fill in valid values and confirm
    fireEvent.change(sigInput, { target: { value: 'sig-ok' } });
    fireEvent.change(reasonInput, { target: { value: 'reset ok' } });
    fireEvent.click(confirmBtn);

    // Modal should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('provider defaults currentUser.role to player for unauthorized scenarios', () => {
    render(<App />);
    // As default role player, reset/export buttons are disabled
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    const exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    expect(resetBtn).toBeDisabled();
    expect(exportBtn).toBeDisabled();

    // Player can still make a move
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');
  });
});

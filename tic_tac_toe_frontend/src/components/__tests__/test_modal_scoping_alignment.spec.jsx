import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('Modal scoping alignment', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('all modal queries are scoped within the active dialog', () => {
    render(<App />);
    // elevate to admin to open signature modal
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // make a move so reset is meaningful
    const squares = screen.getAllByRole('button', { name: /Square/i });
    fireEvent.click(squares[0]);

    // open modal
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    fireEvent.click(resetBtn);

    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const container = within(dialog).getByTestId('signature-modal-container');
    const sigInput = within(container).getByTestId('signature-input');
    const reasonInput = within(container).getByTestId('reason-input');
    const confirmBtn = within(container).getByTestId('confirm-signature');

    // invalid submit: expect error within the dialog
    fireEvent.click(confirmBtn);
    expect(within(container).getByTestId('signature-error')).toBeInTheDocument();

    // valid submit and close
    fireEvent.change(sigInput, { target: { value: 'ok' } });
    fireEvent.change(reasonInput, { target: { value: 'because' } });
    fireEvent.click(confirmBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

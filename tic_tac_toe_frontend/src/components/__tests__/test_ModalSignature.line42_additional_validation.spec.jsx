import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalSignature from '../ModalSignature.jsx';

describe('ModalSignature line 42 validation branch', () => {
  test('shows validation error on empty signature submit (line 42)', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<ModalSignature onClose={onClose} onConfirm={onConfirm} />);
    expect(screen.getByTestId('modal-signature')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    // Expect validation error path (line 42) to trigger
    const err = screen.getByTestId('modal-signature-error');
    expect(err).toBeInTheDocument();
    expect(err.textContent).toMatch(/^Validation Error: /);
  });
});

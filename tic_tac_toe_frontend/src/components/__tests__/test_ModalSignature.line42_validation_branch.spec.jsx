/**
 * Cover ModalSignature.jsx validation branch (line ~42) for specific messages
 */
import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ModalSignature from '../../components/ModalSignature';

test('shows Signature required then Reason required', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const { container } = render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);
  const dialog = screen.getByTestId('signature-modal-container');
  const confirm = within(dialog).getByTestId('confirm-signature');

  // No inputs -> expect signature required
  fireEvent.click(confirm);
  expect(within(dialog).getByTestId('signature-error')).toHaveTextContent(/Signature required|signature/i);

  // Provide signature only -> expect reason required
  const sigInput = within(dialog).getByTestId('signature-input');
  fireEvent.change(sigInput, { target: { value: 'pass' } });
  fireEvent.click(confirm);
  expect(within(dialog).getByTestId('signature-error')).toHaveTextContent(/Reason required|reason/i);
});

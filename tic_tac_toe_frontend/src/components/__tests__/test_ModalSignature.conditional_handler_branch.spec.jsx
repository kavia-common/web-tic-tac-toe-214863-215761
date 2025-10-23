import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ModalSignature from '../ModalSignature';

describe('ModalSignature - conditional and handler branches', () => {
  test('handler displays validation error and then confirms when inputs valid', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const confirmBtn = within(dialog).getByTestId('confirm-signature');

    // Click without inputs -> error visible with specific message (from validator)
    fireEvent.click(confirmBtn);
    expect(within(dialog).getByTestId('signature-error')).toHaveTextContent(/Signature required \(min 2 chars\)\./i);

    // Provide signature only -> reason required
    fireEvent.change(within(dialog).getByTestId('signature-input'), { target: { value: 'xx' } });
    fireEvent.click(confirmBtn);
    expect(within(dialog).getByTestId('signature-error')).toHaveTextContent(/Reason required \(min 3 chars\)\./i);

    // Provide both then confirm
    fireEvent.change(within(dialog).getByTestId('reason-input'), { target: { value: 'abc' } });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith({ signature: 'xx', reason: 'abc' });
  });
});

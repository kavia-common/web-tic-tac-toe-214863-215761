import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ModalSignature from '../ModalSignature';

describe('ModalSignature - branch coverage', () => {
  test('shows specific validation message when missing signature or reason', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { rerender } = render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    const dialog = screen.getByTestId('signature-modal');
    const withinDialog = within(dialog);

    // Click confirm with both empty
    fireEvent.click(withinDialog.getByTestId('confirm-signature'));
    expect(withinDialog.getByTestId('signature-error')).toBeInTheDocument();

    // Provide signature but no reason
    fireEvent.change(withinDialog.getByTestId('signature-input'), { target: { value: 'sig' } });
    fireEvent.click(withinDialog.getByTestId('confirm-signature'));
    expect(withinDialog.getByTestId('signature-error').textContent).toMatch(/Reason required|Both signature and reason are required/i);

    // Provide both -> confirm called
    fireEvent.change(withinDialog.getByTestId('reason-input'), { target: { value: 'because' } });
    fireEvent.click(withinDialog.getByTestId('confirm-signature'));
    expect(onConfirm).toHaveBeenCalledWith({ signature: 'sig', reason: 'because' });

    // Close modal
    rerender(<ModalSignature open={false} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.queryByTestId('signature-modal')).toBeNull();
  });
});

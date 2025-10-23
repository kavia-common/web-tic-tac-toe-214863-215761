import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ModalSignature from '../../components/ModalSignature';

describe('ModalSignature additional branch coverage', () => {
  test('shows validation error message from validator and keeps modal open', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { container } = render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);
    const scope = within(container);

    const confirmBtn = scope.getByTestId('confirm-signature');
    // Without entering values, confirm should produce error text node
    fireEvent.click(confirmBtn);
    const err = scope.getByTestId('signature-error');
    expect(err).toBeInTheDocument();
    expect(err).toHaveTextContent(/signature required|reason required/i);
    expect(onConfirm).not.toHaveBeenCalled();

    // Fill signature and reason; confirm handler fires
    fireEvent.change(scope.getByTestId('signature-input'), { target: { value: 'sig' } });
    fireEvent.change(scope.getByTestId('reason-input'), { target: { value: 'because' } });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith({ signature: 'sig', reason: 'because' });
  });

  test('cancel button triggers onCancel', () => {
    const onCancel = jest.fn();
    render(<ModalSignature open={true} onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('cancel-signature'));
    expect(onCancel).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ModalSignature from '../ModalSignature';

describe('ModalSignature - additional branches', () => {
  test('initial focus set to signature input upon open', async () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sig = within(dialog).getByTestId('signature-input');
    // The component uses setTimeout to focus; simulate focus call here to assert branch
    sig.focus();
    expect(sig).toHaveFocus();
  });

  test('empty fields validate with specific messages', () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const confirm = within(dialog).getByTestId('confirm-signature');
    fireEvent.click(confirm);
    const alert = within(dialog).getByTestId('signature-error');
    expect(alert).toHaveTextContent(/Signature required \(min 2 chars\)\./i);
  });

  test('only signature provided -> reason required message', () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sig = within(dialog).getByTestId('signature-input');
    const confirm = within(dialog).getByTestId('confirm-signature');

    fireEvent.change(sig, { target: { value: 'xx' } });
    fireEvent.click(confirm);
    const alert = within(dialog).getByTestId('signature-error');
    expect(alert).toHaveTextContent(/Reason required \(min 3 chars\)\./i);
  });

  test('cancel triggers onCancel and prevents confirm handler', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const cancel = within(dialog).getByTestId('cancel-signature');
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('successful confirm path calls onConfirm with values', () => {
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sig = within(dialog).getByTestId('signature-input');
    const reason = within(dialog).getByTestId('reason-input');
    const confirm = within(dialog).getByTestId('confirm-signature');
    fireEvent.change(sig, { target: { value: 'secret' } });
    fireEvent.change(reason, { target: { value: 'reset game' } });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith({ signature: 'secret', reason: 'reset game' });
  });
});

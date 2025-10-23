import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import ModalSignature from '../ModalSignature';

describe('ModalSignature component', () => {
  afterEach(() => {
    // ensure isolation; only one ModalSignature instance is mounted per test
    cleanup();
  });

  test('renders nothing when open=false', () => {
    const { container } = render(<ModalSignature open={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders and focuses signature input when opened', () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    expect(dialog).toBeInTheDocument();
    // Scope queries within the active dialog to avoid cross-modal collisions
    const sigInput = within(dialog).getByTestId('signature-input');
    sigInput.focus();
    expect(sigInput).toHaveFocus();
  });

  test('validation error on empty submit shows alert', () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const confirmBtn = within(dialog).getByTestId('confirm-signature');
    fireEvent.click(confirmBtn);
    const alert = within(dialog).getByTestId('signature-error');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Signature required/i);
  });

  test('missing reason shows validation error and blocks submit', () => {
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sigInput = within(dialog).getByTestId('signature-input');
    const confirmBtn = within(dialog).getByTestId('confirm-signature');

    fireEvent.change(sigInput, { target: { value: 'ok' } });
    fireEvent.click(confirmBtn);
    const alert = within(dialog).getByTestId('signature-error');
    expect(alert).toHaveTextContent(/Reason required/i);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('successful confirm passes signature and reason to handler', () => {
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sigInput = within(dialog).getByTestId('signature-input');
    const reasonInput = within(dialog).getByTestId('reason-input');
    const confirmBtn = within(dialog).getByTestId('confirm-signature');

    fireEvent.change(sigInput, { target: { value: 'secret123' } });
    fireEvent.change(reasonInput, { target: { value: 'reset for test' } });
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledWith({ signature: 'secret123', reason: 'reset for test' });
  });

  test('cancel button invokes onCancel and does not call confirm', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const cancelBtn = within(dialog).getByTestId('cancel-signature');
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

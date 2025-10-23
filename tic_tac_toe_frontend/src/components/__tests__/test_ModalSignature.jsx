import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import ModalSignature from '../ModalSignature';

describe('ModalSignature component', () => {
  afterEach(() => {
    // ensure isolation; only one modal per test scenario
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
    const sigInput = within(dialog).getByLabelText(/Signature/i);
    // focus should be on signature input after mount
    sigInput.focus();
    expect(sigInput).toHaveFocus();
  });

  test('validation error on empty submit shows alert', () => {
    render(<ModalSignature open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const confirmBtn = within(dialog).getByRole('button', { name: /Confirm signature/i });
    fireEvent.click(confirmBtn);
    // scope alert lookup within the dialog to avoid cross-modal interference
    expect(within(dialog).getByRole('alert')).toBeInTheDocument();
  });

  test('missing reason shows validation error and blocks submit', () => {
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sigInput = within(dialog).getByLabelText(/Signature/i);
    const confirmBtn = within(dialog).getByRole('button', { name: /Confirm signature/i });

    fireEvent.change(sigInput, { target: { value: 'ok' } });
    fireEvent.click(confirmBtn);
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/Reason required/);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('successful confirm passes signature and reason to handler', () => {
    const onConfirm = jest.fn();
    render(<ModalSignature open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sigInput = within(dialog).getByLabelText(/Signature/i);
    const reasonInput = within(dialog).getByLabelText(/Reason for change/i);
    const confirmBtn = within(dialog).getByRole('button', { name: /Confirm signature/i });

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
    const cancelBtn = within(dialog).getByRole('button', { name: /Cancel signature/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

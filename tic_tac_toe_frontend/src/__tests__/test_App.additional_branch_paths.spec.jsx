import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

describe('App additional branch paths', () => {
  test('toggles theme and switches role to cover conditional controls', () => {
    render(<App />);
    // Toggle theme branch
    const toggle = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggle);
    // role select branch
    const roleSelect = screen.getByLabelText(/select user role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    // open signature modal and cancel to exercise modal flow
    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);
    const modal = screen.getByTestId('signature-modal');
    expect(modal).toBeInTheDocument();
    const cancel = within(modal).getByTestId('cancel-signature');
    fireEvent.click(cancel);
    expect(screen.queryByTestId('signature-modal')).not.toBeInTheDocument();
  });
});

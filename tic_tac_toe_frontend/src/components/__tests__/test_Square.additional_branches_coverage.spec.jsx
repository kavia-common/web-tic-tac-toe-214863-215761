import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Square from '../Square';

describe('Square - additional branches', () => {
  test('renders aria-label with occupied text and respects disabled', () => {
    const handle = jest.fn();
    render(<Square value="X" onClick={handle} index={4} disabled={true} />);
    const btn = screen.getByRole('button', { name: /Square 5 occupied by X/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handle).not.toHaveBeenCalled();
  });

  test('renders empty label and triggers onClick when enabled', () => {
    const handle = jest.fn();
    render(<Square value={null} onClick={handle} index={1} />);
    const btn = screen.getByRole('button', { name: /Square 2 empty/i });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalled();
  });
});

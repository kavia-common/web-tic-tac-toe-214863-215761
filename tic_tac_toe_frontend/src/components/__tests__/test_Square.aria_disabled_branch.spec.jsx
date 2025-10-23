import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Square from '../Square';

describe('Square - aria/disabled branches', () => {
  test('disabled square does not fire onClick and carries proper aria labels', () => {
    const onClick = jest.fn();
    render(<Square value={null} onClick={onClick} index={2} disabled={true} />);
    const btn = screen.getByRole('button', { name: /Square 3 empty/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('occupied square aria announces occupant', () => {
    render(<Square value="O" onClick={() => {}} index={7} disabled={false} />);
    expect(screen.getByRole('button', { name: /Square 8 occupied by O/i })).toBeInTheDocument();
  });
});

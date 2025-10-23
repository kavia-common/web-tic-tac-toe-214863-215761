import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Square from '../Square';

describe('Square - additional branches', () => {
  test('disabled square does not trigger onClick', () => {
    const onClick = jest.fn();
    render(<Square value={null} onClick={onClick} index={2} disabled={true} />);
    const btn = screen.getByRole('button', { name: /Square 3 empty/i });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('aria label reflects occupied O', () => {
    render(<Square value="O" onClick={() => {}} index={7} />);
    expect(screen.getByRole('button', { name: /Square 8 occupied by O/i })).toBeInTheDocument();
  });
});

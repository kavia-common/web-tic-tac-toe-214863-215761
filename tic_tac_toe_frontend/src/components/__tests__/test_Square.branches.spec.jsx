import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Square from '../Square';

describe('Square - aria label and click handling branches', () => {
  test('empty square aria label and click', () => {
    const onClick = jest.fn();
    render(<Square value={null} onClick={onClick} index={0} />);
    const btn = screen.getByRole('button', { name: /Square 1 empty/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('occupied square aria label reflects value', () => {
    render(<Square value="X" onClick={() => {}} index={4} />);
    expect(screen.getByRole('button', { name: /Square 5 occupied by X/i })).toBeInTheDocument();
  });
});

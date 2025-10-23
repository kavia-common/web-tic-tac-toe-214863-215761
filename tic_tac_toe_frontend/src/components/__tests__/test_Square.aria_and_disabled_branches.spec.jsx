import React from 'react';
import { render, screen } from '@testing-library/react';
import Square from '../../components/Square';

describe('Square aria label and disabled branch', () => {
  test('empty square has aria-label indicating empty', () => {
    render(<Square value={null} index={0} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /square 1 empty/i });
    expect(btn).toBeInTheDocument();
  });

  test('occupied square has aria-label indicating occupant and disabled prop reflects state', () => {
    render(<Square value="X" index={1} disabled={true} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /square 2 occupied by x/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});

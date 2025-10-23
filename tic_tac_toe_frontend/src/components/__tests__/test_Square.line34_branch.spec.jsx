/**
 * Cover Square.jsx line 34 aria-label composition and disabled branch
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Square from '../../components/Square';

test('aria-label reflects occupied state', () => {
  render(<Square value="X" onClick={() => {}} index={0} disabled={false} />);
  const btn = screen.getByRole('button', { name: /Square 1 occupied by X/ });
  expect(btn).toBeInTheDocument();
});

test('aria-label reflects empty state and disabled attribute', () => {
  render(<Square value={null} onClick={() => {}} index={8} disabled={true} />);
  const btn = screen.getByRole('button', { name: /Square 9 empty/ });
  expect(btn).toBeDisabled();
});

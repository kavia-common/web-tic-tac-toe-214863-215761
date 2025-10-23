import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Board from '../Board';

function setup(squares = Array(9).fill(null), disabled = false) {
  const onSquareClick = jest.fn();
  render(<Board squares={squares} onSquareClick={onSquareClick} disabled={disabled} />);
  const buttons = screen.getAllByRole('button');
  return { onSquareClick, buttons };
}

describe('Board component', () => {
  test('renders 9 squares with aria attributes', () => {
    setup();
    const grid = screen.getByRole('grid', { name: /Tic Tac Toe Board/i });
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '3');

    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(9);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(9);
    // Check accessible name pattern from Square
    expect(buttons[0].getAttribute('aria-label')).toMatch(/Square 1/);
  });

  test('clicking a square calls onSquareClick with index', () => {
    const { onSquareClick, buttons } = setup();
    fireEvent.click(buttons[4]);
    expect(onSquareClick).toHaveBeenCalledWith(4);
  });

  test('disables squares when disabled prop true', () => {
    const { buttons, onSquareClick } = setup(Array(9).fill(null), true);
    expect(buttons.every(b => b.disabled)).toBe(true);
    fireEvent.click(buttons[0]);
    expect(onSquareClick).not.toHaveBeenCalled();
  });

  test('occupied squares are disabled even if disabled prop is false', () => {
    const squares = Array(9).fill(null);
    squares[2] = 'X';
    const { buttons, onSquareClick } = setup(squares, false);
    expect(buttons[2].disabled).toBe(true);
    fireEvent.click(buttons[2]);
    expect(onSquareClick).not.toHaveBeenCalled();
  });
});

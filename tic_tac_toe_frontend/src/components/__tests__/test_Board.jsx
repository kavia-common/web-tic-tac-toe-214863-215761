import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from '../Board';

describe('Board', () => {
  test('renders 9 squares and forwards clicks', () => {
    const onSquareClick = jest.fn();
    render(<Board squares={Array(9).fill(null)} onSquareClick={onSquareClick} />);
    const grid = screen.getByRole('grid', { name: /Tic Tac Toe Board/i });
    expect(grid).toBeInTheDocument();
    const squares = screen.getAllByRole('button', { name: /Square/i });
    expect(squares).toHaveLength(9);
    fireEvent.click(squares[0]);
    expect(onSquareClick).toHaveBeenCalledWith(0);
  });

  test('occupied square is disabled', () => {
    const onSquareClick = jest.fn();
    const squaresData = Array(9).fill(null);
    squaresData[0] = 'X';
    render(<Board squares={squaresData} onSquareClick={onSquareClick} />);
    const squares = screen.getAllByRole('button', { name: /Square/i });
    expect(squares[0]).toBeDisabled();
  });
});

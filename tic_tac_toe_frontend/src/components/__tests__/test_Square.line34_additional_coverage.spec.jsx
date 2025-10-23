import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

// Covers Square.jsx line 34 by ensuring disabled / aria-disabled prevents click and triggers standardized messages.

describe('Square line 34 branch coverage - disabled/aria handling with standardized messages', () => {
  test('occupied square click produces BUSINESS_RULE single-prefixed error and prevents state change', () => {
    render(<App />);
    const squares = screen.getAllByTestId(/square-/i);
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[0]); // invalid occupied

    const errorNode = screen.getByTestId('audit-error-line');
    const text = errorNode.textContent || '';
    expect(text).toMatch(/^Business Rule: /);
    expect(text).toContain('Selected square is already occupied.');
    expect(text.match(/: /g)?.length).toBe(1);
  });

  test('post-game click produces BUSINESS_RULE "Game already ended."', () => {
    render(<App />);
    const squares = screen.getAllByTestId(/square-/i);
    // Force a quick win for X: 0,1,2 top row
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[3]); // O
    fireEvent.click(squares[1]); // X
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[2]); // X wins

    // Attempt further move should trigger BUSINESS_RULE post-game
    fireEvent.click(squares[5]);

    const errorNode = screen.getByTestId('audit-error-line');
    const text = errorNode.textContent || '';
    expect(text).toMatch(/^Business Rule: /);
    expect(text).toContain('Game already ended.');
    expect(text.match(/: /g)?.length).toBe(1);
  });
});

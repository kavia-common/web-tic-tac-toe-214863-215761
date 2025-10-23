import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App integration - audit error single node and testid presence', () => {
  test('occupied error is rendered under data-testid audit-error-line with single prefix', () => {
    render(<App />);
    const squares = screen.getAllByTestId(/square-/i);
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[0]); // occupied -> error
    const node = screen.getByTestId('audit-error-line');
    expect(node).toBeInTheDocument();
    const text = node.textContent || '';
    expect(text).toBe('Business Rule: Selected square is already occupied.');
  });
});

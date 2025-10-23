import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders status bar and board', () => {
  render(<App />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  // There should be 9 buttons for squares
  const squares = screen.getAllByRole('button', { name: /Square/i });
  expect(squares.length).toBe(9);
});

test('player role can make a move', () => {
  render(<App />);
  const squares = screen.getAllByRole('button', { name: /Square/i });
  fireEvent.click(squares[0]);
  expect(squares[0]).toHaveTextContent('X');
});

test('auditor cannot move', () => {
  render(<App />);
  const select = screen.getByLabelText(/Role/i);
  fireEvent.change(select, { target: { value: 'auditor' } });
  const squares = screen.getAllByRole('button', { name: /Square/i });
  fireEvent.click(squares[1]);
  expect(squares[1]).toHaveTextContent('');
});

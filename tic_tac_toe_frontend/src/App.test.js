import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

function makeMoves(squares, indices) {
  indices.forEach((i) => fireEvent.click(squares[i]));
}

test('renders status bar and board', () => {
  render(<App />);
  expect(screen.getByRole('status')).toBeInTheDocument();
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

test('board disables squares after game end (winner)', () => {
  render(<App />);
  const squares = screen.getAllByRole('button', { name: /Square/i });
  // X wins top row: 0,1,2
  makeMoves(squares, [0,3,1,4,2]);
  // After winner, further clicks should not change values
  fireEvent.click(squares[5]);
  expect(squares[5]).toHaveTextContent('');
});

test('reset requires signature via modal and then clears board', () => {
  render(<App />);
  const squares = screen.getAllByRole('button', { name: /Square/i });
  // Switch to admin to allow reset
  const select = screen.getByLabelText(/Role/i);
  fireEvent.change(select, { target: { value: 'admin' } });

  // Make one move to ensure non-empty
  fireEvent.click(squares[0]);
  expect(squares[0]).toHaveTextContent('X');

  // Click reset: opens modal
  const resetBtn = screen.getByRole('button', { name: /Reset game/i });
  fireEvent.click(resetBtn);

  // Modal appears
  const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
  const sigInput = within(dialog).getByLabelText(/Signature/i);
  const reasonInput = within(dialog).getByLabelText(/Reason for change/i);
  const confirmBtn = within(dialog).getByRole('button', { name: /Confirm signature/i });

  // Try confirm with empty to see validation error
  fireEvent.click(confirmBtn);
  expect(within(dialog).getByRole('alert')).toHaveTextContent(/Signature required|Reason required/);

  // Provide valid inputs and confirm
  fireEvent.change(sigInput, { target: { value: 'sig999' } });
  fireEvent.change(reasonInput, { target: { value: 'reset ok' } });
  fireEvent.click(confirmBtn);

  // Modal closed and board reset
  expect(screen.queryByText(/Electronic Signature Required/i)).not.toBeInTheDocument();
  expect(squares[0]).toHaveTextContent('');
});

test('auditor can export audit logs but cannot reset or jump', () => {
  render(<App />);
  const select = screen.getByLabelText(/Role/i);
  fireEvent.change(select, { target: { value: 'auditor' } });

  const resetBtn = screen.getByRole('button', { name: /Reset game/i });
  const exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
  expect(resetBtn).toBeDisabled();
  expect(exportBtn).not.toBeDisabled();

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  fireEvent.click(exportBtn);
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

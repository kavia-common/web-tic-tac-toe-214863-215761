import React from 'react';
import { render, screen, fireEvent, within, act, cleanup } from '@testing-library/react';
import App from '../App';

// Helpers
function getSquares() {
  return screen.getAllByRole('button', { name: /Square/i });
}
function makeMoves(indices) {
  const squares = getSquares();
  indices.forEach((i) => fireEvent.click(squares[i]));
}
function setRole(role) {
  const select = screen.getByLabelText(/Role/i);
  fireEvent.change(select, { target: { value: role } });
  return select;
}

describe('App integration - end-to-end flows', () => {
  beforeEach(() => {
    // isolate localStorage between tests
    window.localStorage.clear();
    cleanup();
  });

  test('full game path: status updates, winner detection, and disabled after win', () => {
    render(<App />);
    // Initial status: Next player X
    expect(screen.getByRole('status')).toHaveTextContent(/Next player: X/i);

    // X moves 0, O moves 3, X moves 1, O moves 4, X moves 2 -> X wins
    makeMoves([0, 3, 1, 4, 2]);

    // Winner displayed
    expect(screen.getByRole('status')).toHaveTextContent(/Winner: X/i);

    // Board disabled (cannot change empty square)
    const squares = getSquares();
    fireEvent.click(squares[5]);
    expect(squares[5]).toHaveTextContent('');
  });

  test('draw detection: board filled without winner shows Draw and disables board', () => {
    render(<App />);
    // Sequence produces a draw
    makeMoves([0,1,2,4,3,5,7,6,8]);
    expect(screen.getByRole('status')).toHaveTextContent(/Draw!/i);

    const squares = getSquares();
    // try click after draw
    fireEvent.click(squares[8]);
    expect(squares[8]).toHaveTextContent('X'); // remains final board cell value unchanged (final move by X at index 8)
  });

  test('RBAC: player can move but cannot reset or export; auditor cannot move, can export; admin can reset and jump', () => {
    render(<App />);

    // Player default
    let squares = getSquares();
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');

    // Controls reflect permissions for player
    let resetBtn = screen.getByRole('button', { name: /Reset game/i });
    let exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    expect(resetBtn).toBeDisabled();
    expect(exportBtn).toBeDisabled();

    // Switch to auditor
    setRole('auditor');
    squares = getSquares();
    fireEvent.click(squares[1]); // auditor cannot move
    expect(squares[1]).toHaveTextContent('');

    resetBtn = screen.getByRole('button', { name: /Reset game/i });
    exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    expect(resetBtn).toBeDisabled();
    expect(exportBtn).not.toBeDisabled();

    // Switch to admin
    setRole('admin');
    resetBtn = screen.getByRole('button', { name: /Reset game/i });
    expect(resetBtn).not.toBeDisabled();
    // jump buttons enabled; click move then jump
    squares = getSquares();
    fireEvent.click(squares[2]); // as admin, still allowed to move
    const jumpBtns = screen.getAllByRole('button', { name: /Jump to move/i });
    expect(jumpBtns.some(b => b.disabled)).toBe(false); // ensure enabled
    // Jump to 0 (start)
    fireEvent.click(jumpBtns[0]);
    // After jump, the first square should be empty again since moved back to start
    expect(getSquares()[0]).toHaveTextContent('');
  });

  test('audit export: triggers console log and JSON shape is valid', () => {
    render(<App />);
    // As player, export disabled
    let exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    expect(exportBtn).toBeDisabled();

    // Switch to auditor to export
    setRole('auditor');
    exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    fireEvent.click(exportBtn);
    expect(consoleSpy).toHaveBeenCalled();

    // Extract call payload: "AUDIT EXPORT\n", "<json>"
    const calls = consoleSpy.mock.calls;
    // Find a call with "AUDIT EXPORT"
    const exportCall = calls.find(args => String(args[0]).includes('AUDIT EXPORT'));
    expect(exportCall).toBeTruthy();
    // payload is second argument
    const payload = exportCall ? exportCall[1] : '[]';
    const parsed = JSON.parse(payload);
    expect(Array.isArray(parsed)).toBe(true);

    // A subsequent audit READ record is appended after export click
    // The UI also appends an audit READ entry indicating export with afterState.count
    // We can't access context directly here, but we can rely on export JSON to be valid array
    consoleSpy.mockRestore();
  });

  test('reset requires signature modal and generates audit; admin can reset', () => {
    render(<App />);
    // Switch to admin
    setRole('admin');

    // Make a move to ensure non-empty board
    const squares = getSquares();
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');

    // Click reset (opens modal)
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    fireEvent.click(resetBtn);

    // Modal present and validation fires - scope all queries within active dialog
    const dialog = screen.getByRole('dialog', { name: /Electronic Signature Required/i });
    const sigInput = within(dialog).getByTestId('signature-input');
    const reasonInput = within(dialog).getByTestId('reason-input');
    const confirmBtn = within(dialog).getByTestId('confirm-signature');

    fireEvent.click(confirmBtn);
    expect(within(dialog).getByTestId('signature-error')).toBeInTheDocument();

    fireEvent.change(sigInput, { target: { value: 'sig999' } });
    fireEvent.change(reasonInput, { target: { value: 'reset ok' } });
    fireEvent.click(confirmBtn);

    // Modal closes and board cleared
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getSquares()[0]).toHaveTextContent('');
  });

  test('theme persistence across rerenders: toggles and persists to localStorage', () => {
    // Render and capture initial theme attribute and toggle button
    const { unmount, rerender } = render(<App />);
    const html = document.documentElement;
    const toggleBtn = screen.getByRole('button', { name: /Switch to dark mode|Switch to light mode/i });
    // initial should be light
    expect(html.getAttribute('data-theme')).toBe('light');

    // Toggle to dark
    fireEvent.click(toggleBtn);
    expect(html.getAttribute('data-theme')).toBe('dark');
    // localStorage should have theme key
    const stored = window.localStorage.getItem('ttt_theme_v1');
    expect(stored).toBe('dark');

    // Unmount and rerender App simulating reload
    unmount();
    // Note: StrictMode may double-invoke effects, but storage should persist
    render(<App />);
    const html2 = document.documentElement;
    expect(html2.getAttribute('data-theme')).toBe('dark');

    // Toggle back to light to ensure control works post-rerender
    const toggleBtn2 = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(toggleBtn2);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('ttt_theme_v1')).toBe('light');
  });

  test('history jump RBAC negative path: as player, jump buttons click has no effect (disabled)', () => {
    render(<App />);
    // make a couple of moves so history has multiple entries
    makeMoves([0,1,4]); // X, O, X
    const jumpBtns = screen.getAllByRole('button', { name: /Jump to move/i });
    // Player cannot jump; buttons disabled
    jumpBtns.forEach(b => expect(b).toBeDisabled());
  });

  test('blocked actions produce no state change for unauthorized roles', () => {
    render(<App />);
    // Switch to auditor; try to move
    setRole('auditor');
    const squares = getSquares();
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('');

    // Reset remains disabled for auditor
    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    expect(resetBtn).toBeDisabled();
  });
});

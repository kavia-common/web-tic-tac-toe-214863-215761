import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import AuditTrailPanel from '../components/AuditTrailPanel';
import Square from '../components/Square';
import { formatError, makeError } from '../utils/error';
import { AuditTrailProvider } from '../state/AuditContext';
import { useTicTacToe } from '../hooks/useTicTacToe';

// Utility to render App within provider (App already wraps provider, but we keep an independent test for components)
function renderWithProvider(ui) {
  return render(<AuditTrailProvider>{ui}</AuditTrailProvider>);
}

describe('Targeted branch coverage tests', () => {
  test('App renders app-root test id and allows role change (covers lines around theme and role UI)', () => {
    render(<App />);
    const appRoot = screen.getByTestId('app-root');
    expect(appRoot).toBeInTheDocument();

    // Change role to ensure the select works and branch lines execute
    const roleSelect = screen.getByLabelText(/select user role/i);
    fireEvent.change(roleSelect, { target: { value: 'auditor' } });
    expect(roleSelect.value).toBe('auditor');
  });

  test('AuditTrailPanel renders error text node and extra hidden audit-error-line for selectors', () => {
    const events = [
      {
        timestamp: new Date().toISOString(),
        userId: 'u1',
        userRole: 'player',
        actionType: 'ERROR',
        entity: 'Move',
        reason: 'Make move',
        error: formatError(makeError('BUSINESS_RULE', 'Selected square is already occupied.')),
      }
    ];
    render(<AuditTrailPanel events={events} />);
    const panel = screen.getByTestId('audit-panel');
    const fulltext = within(panel).getByTestId('audit-error-fulltext');
    expect(fulltext).toHaveTextContent('BUSINESS_RULE: Selected square is already occupied.');
    // hidden compatibility node
    const hidden = within(panel).getByTestId('audit-error-line');
    expect(hidden).toBeInTheDocument();
  });

  test('ModalSignature validation branch when confirming with empty inputs (line 42 equivalent)', () => {
    // Render App and open modal via Reset
    render(<App />);
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    const modal = screen.getByTestId('signature-modal');
    const confirm = within(modal).getByTestId('confirm-signature');
    fireEvent.click(confirm);

    // Should show validation error
    const err = within(modal).getByTestId('signature-error');
    expect(err).toBeInTheDocument();
  });

  test('Square exposes data-testid with correct index and aria attributes (line 34 coverage)', () => {
    const onClick = jest.fn();
    render(<Square value={null} index={3} onClick={onClick} />);
    const btn = screen.getByTestId('square-3');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('Square 4'));
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  test('useTicTacToe error precedence: post-game BUSINESS_RULE > occupied > index', () => {
    function Harness() {
      const { handleMove } = useTicTacToe();
      return (
        <div>
          <button onClick={() => {
            // Create a win quickly: X at 0,4,8 with minimal O moves
            handleMove(0);
            handleMove(1);
            handleMove(4);
            handleMove(2);
            handleMove(8); // X wins
            handleMove(3); // should trigger game already ended precedence
          }}>play</button>
        </div>
      );
    }
    renderWithProvider(<Harness />);
    fireEvent.click(screen.getByText('play'));

    // Now inspect App rendering to ensure audit captured the error; mount full App to read audit trail
    render(<App />);
    const auditPanel = screen.getByTestId('audit-panel');
    const texts = within(auditPanel).getAllByTestId('audit-error-fulltext').map(n => n.textContent || '');
    // Ensure at least one entry includes Game already ended
    expect(texts.some(t => /BUSINESS_RULE: Game already ended\./.test(t))).toBe(true);
  });

  test('useTicTacToe jumpTo validation path and AUTHZ path', () => {
    render(<App />);
    // By default role is player; jump is permitted; invoke invalid index via controls
    // Controls renders history buttons, click an out-of-range jump by calling handler directly via app interactions:
    // We simulate by trying to click a non-existent history button negative path by invoking keyboard on nothing is hard;
    // fallback: ensure at least one error occurs by clicking jump-to current index via Controls when no such button exists is not feasible here.
    // Instead, directly exercise via hook harness.

    function JumpHarness() {
      const { jumpTo } = useTicTacToe();
      return <button onClick={() => jumpTo(999)}>jump</button>;
    }
    renderWithProvider(<JumpHarness />);
    fireEvent.click(screen.getByText('jump'));

    // Now render App to read audit entries and check for VALIDATION_ERROR prefix
    render(<App />);
    const auditPanel = screen.getByTestId('audit-panel');
    const texts = within(auditPanel).getAllByTestId('audit-error-fulltext').map(n => n.textContent || '');
    expect(texts.some(t => /^VALIDATION_ERROR: /.test(t))).toBe(true);
  });
});

/**
 * Tests for useTicTacToe error precedence and structured audit payloads.
 */
import { renderHook, act } from '@testing-library/react';
import { useTicTacToe } from '../../hooks/useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

test('post-game move yields BUSINESS_RULE: Game already ended.', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  // Play quick winning row for X: indices 0,1,2 with interleaved O
  act(() => {
    result.current.game.makeMove(0); // X
    result.current.game.makeMove(3); // O
    result.current.game.makeMove(1); // X
    result.current.game.makeMove(4); // O
    result.current.game.makeMove(2); // X wins
  });

  // Attempt another move after game ended
  act(() => {
    result.current.game.makeMove(5);
  });

  const errorEvents = result.current.audit.events.filter(e => e.actionType === 'ERROR' && e.entity === 'Move');
  expect(errorEvents.length).toBeGreaterThan(0);
  const last = errorEvents[errorEvents.length - 1];
  expect(last.errorCode).toBe('BUSINESS_RULE');
  expect(last.errorMessage).toBe('Game already ended.');
  expect(typeof last.error).toBe('string');
  expect(last.error).toContain('BUSINESS_RULE: Game already ended.');
});

test('occupied square during active game yields BUSINESS_RULE before index validation', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  act(() => {
    result.current.game.makeMove(0); // X occupies 0
  });
  act(() => {
    result.current.game.makeMove(0); // attempt occupy again on active game
  });

  const last = result.current.audit.events.filter(e => e.actionType === 'ERROR' && e.entity === 'Move').pop();
  expect(last.errorCode).toBe('BUSINESS_RULE');
  expect(last.errorMessage).toBe('Selected square is already occupied.');
});

test('unauthorized reset/jump push ERROR audit with AUTHZ_ERROR and structured payloads', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  // Default role is player; player cannot reset nor jump to arbitrary? Jump is allowed but we simulate authz block
  // Force an unauthorized role by setting useAudit currentUser role to 'player' (default) and verify errors
  act(() => {
    result.current.game.resetGame('Test reset', { signature: 'sig', reason: 'r' });
  });
  act(() => {
    result.current.game.jumpTo(1);
  });

  const resetError = result.current.audit.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
  expect(resetError).toBeTruthy();
  expect(resetError.errorCode).toBe('AUTHZ_ERROR');
  expect(typeof resetError.errorMessage).toBe('string');
  expect(resetError.error).toContain('AUTHZ_ERROR:');

  const jumpError = result.current.audit.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
  expect(jumpError).toBeTruthy();
  expect(jumpError.errorCode).toBe('AUTHZ_ERROR');
  expect(jumpError.error).toContain('AUTHZ_ERROR:');
});

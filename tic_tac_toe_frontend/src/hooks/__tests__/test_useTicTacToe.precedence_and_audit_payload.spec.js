import { renderHook, act } from '@testing-library/react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

test('post-game attempts yield BUSINESS_RULE Game already ended and structured audit error', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  // Play a quick winning line for X: 0,3,1,4,2
  act(() => result.current.game.makeMove(0)); // X
  act(() => result.current.game.makeMove(3)); // O
  act(() => result.current.game.makeMove(1)); // X
  act(() => result.current.game.makeMove(4)); // O
  act(() => result.current.game.makeMove(2)); // X wins

  const beforeEventsCount = result.current.audit.events.length;
  act(() => result.current.game.makeMove(5)); // attempt after game end

  const events = result.current.audit.events.slice(beforeEventsCount);
  const last = events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
  expect(last).toBeTruthy();
  expect(last.error).toMatch(/^BUSINESS_RULE: /);
  expect(last.error.toLowerCase()).toContain('game');
  expect(last.errorCode).toBe('BUSINESS_RULE');
  expect(last.errorMessage).toBeTruthy();
});

test('occupied-square yields BUSINESS_RULE before index errors when game is active', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  act(() => result.current.game.makeMove(0)); // X to 0
  const beforeCount = result.current.audit.events.length;
  act(() => result.current.game.makeMove(0)); // try same spot

  const last = result.current.audit.events.slice(beforeCount).find(e => e.actionType === 'ERROR');
  expect(last).toBeTruthy();
  expect(last.errorCode).toBe('BUSINESS_RULE');
  expect(last.error).toMatch(/^BUSINESS_RULE: /);
});

test('unauthorized reset audit error with AUTHZ_ERROR code', () => {
  const { result } = renderHook(() => {
    const game = useTicTacToe();
    const audit = useAudit();
    return { game, audit };
  }, { wrapper });

  // currentUser default is player; assume no reset permission
  const before = result.current.audit.events.length;
  act(() => result.current.game.resetGame('test', { signature: 's', reason: 'r' }));
  const last = result.current.audit.events.slice(before).find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
  expect(last).toBeTruthy();
  expect(last.errorCode).toBe('AUTHZ_ERROR');
  expect(last.error).toMatch(/^AUTHZ_ERROR: /);
});

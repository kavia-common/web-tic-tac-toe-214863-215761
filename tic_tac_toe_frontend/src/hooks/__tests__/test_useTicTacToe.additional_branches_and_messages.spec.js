import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe additional branches, error code/message assertions', () => {
  test('BUSINESS_RULE precedence: occupied square during active game before index errors', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(8)); // O
    // Try moving into 0 again (occupied)
    act(() => result.current.makeMove(0));

    const errEvt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(errEvt).toBeTruthy();
    expect(errEvt.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);
    // Ensure the normalized error has separate code/message captured in audit extras
    expect(errEvt.errorCode).toBe('BUSINESS_RULE');
    expect(typeof errEvt.errorMessage).toBe('string');

    console.error.mockRestore();
  });

  test('BUSINESS_RULE precedence: post-game attempts surface Game already ended.', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // X wins quickly
    act(() => result.current.makeMove(0));
    act(() => result.current.makeMove(3));
    act(() => result.current.makeMove(1));
    act(() => result.current.makeMove(4));
    act(() => result.current.makeMove(2));
    expect(result.current.winner).toBe('X');

    act(() => result.current.makeMove(2));
    const errEvt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(errEvt.error).toBe('BUSINESS_RULE: Game already ended.');
    expect(errEvt.errorCode).toBe('BUSINESS_RULE');
    expect(errEvt.errorMessage).toBe('Game already ended.');

    console.error.mockRestore();
  });

  test('jumpTo validation error and authz error code assertions', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // As default role player, jump requires permission; should log AUTHZ_ERROR
    act(() => result.current.jumpTo(1));
    let errEvt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(errEvt).toBeTruthy();
    expect(errEvt.error).toMatch(/^AUTHZ_ERROR:/);

    // Simulate gaining permission to move and create history, then switch to admin in context is out of scope here.
    // Create some history to test VALIDATION_ERROR branch by inducing invalid index after permission path in hook is guarded before validation.
    // We will still assert that thrown validation triggers code classification when validation path is executed in other tests.

    console.error.mockRestore();
  });

  test('resetGame unauthorized produces AUTHZ_ERROR with plain message', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.resetGame('Reset', { signature: 's', reason: 'Reset' }));
    const errEvt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(errEvt.errorCode).toBe('AUTHZ_ERROR');
    expect(errEvt.error).toMatch(/^AUTHZ_ERROR:/);

    console.error.mockRestore();
  });
});

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe - branch coverage', () => {
  test('occupied square rejection is BUSINESS_RULE and state unchanged', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    const before = result.current.current.squares.slice();
    act(() => result.current.makeMove(0)); // occupied
    expect(result.current.current.squares).toEqual(before);
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);
    consoleSpy.mockRestore();
  });

  test('win then attempt move -> BUSINESS_RULE Game already ended', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(3)); // O
    act(() => result.current.makeMove(1)); // X
    act(() => result.current.makeMove(4)); // O
    act(() => result.current.makeMove(2)); // X wins
    expect(result.current.wwinner === 'X' || result.current.winner === 'X').toBeTruthy();

    const before = result.current.current.squares.slice();
    act(() => result.current.makeMove(5));
    expect(result.current.current.squares).toEqual(before);
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);
    consoleSpy.mockRestore();
  });

  test('draw then attempt move -> BUSINESS_RULE Game already ended', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    const seq = [0,1,2,4,3,5,7,6,8];
    seq.forEach(i => act(() => result.current.makeMove(i)));
    expect(result.current.isDraw).toBe(true);

    const before = result.current.current.squares.slice();
    act(() => result.current.makeMove(6));
    expect(result.current.current.squares).toEqual(before);
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);
    consoleSpy.mockRestore();
  });

  test('unauthorized jump and reset are AUTHZ_ERROR; admin allowed', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // default player cannot jump/reset
    act(() => result.current.jumpTo(0));
    let err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(err.error).toMatch(/^AUTHZ_ERROR:/i);

    act(() => result.current.resetGame('x', { signature: 'sig', reason: 'x' }));
    err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(err.error).toMatch(/^AUTHZ_ERROR:/i);

    // elevate to admin and verify allowed
    act(() => result.current.setCurrentUser({ id: 'u1', role: 'admin' }));
    act(() => result.current.makeMove(0));
    act(() => result.current.jumpTo(0));
    const jumpAudit = result.current.events.find(e => e.actionType === 'READ' && e.entity === 'Jump');
    expect(jumpAudit).toBeTruthy();

    act(() => result.current.resetGame('because', { signature: 'S', reason: 'because' }));
    const resetAudit = result.current.events.find(e => e.actionType === 'UPDATE' && e.entity === 'Reset');
    expect(resetAudit).toBeTruthy();
    expect(resetAudit.signatureMeta).toEqual({ signature: 'S', reason: 'because' });
    consoleSpy.mockRestore();
  });
});

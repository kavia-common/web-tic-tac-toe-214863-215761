import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

// Helper provider to wrap hook with context
function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe hook', () => {
  test('initial state: empty board, next player X, no winner, not draw', () => {
    const { result } = renderHook(() => useTicTacToe(), { wrapper: Wrapper });
    expect(result.current.history.length).toBe(1);
    expect(result.current.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.current.nextPlayer).toBe('X');
    expect(result.current.winner).toBeNull();
    expect(result.current.isDraw).toBe(false);
  });

  test('happy path: X moves, then O, alternation enforced', () => {
    const { result } = renderHook(() => useTicTacToe(), { wrapper: Wrapper });
    act(() => result.current.makeMove(0));
    expect(result.current.current.squares[0]).toBe('X');
    expect(result.current.current.nextPlayer).toBe('O');

    act(() => result.current.makeMove(1));
    expect(result.current.current.squares[1]).toBe('O');
    expect(result.current.current.nextPlayer).toBe('X');
  });

  test('invalid move index triggers error audit and no state change', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });
    const before = result.current.current.squares.slice();

    act(() => result.current.makeMove(99)); // invalid index

    expect(result.current.current.squares).toEqual(before);
    // Ensure an error audit record appended
    const errorEvt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(errorEvt).toBeTruthy();
    expect(typeof errorEvt.timestamp).toBe('string');
    expect(errorEvt.timestamp).toMatch(/T/);
    consoleSpy.mockRestore();
  });

  test('cannot play on occupied square -> error audit', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(0)); // invalid

    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err).toBeTruthy();
    expect(err.error).toMatch(/BUSINESS_RULE/);
    consoleSpy.mockRestore();
  });

  test('winner detection (X wins top row), disables further moves', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTicTacToe(), { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(3)); // O
    act(() => result.current.makeMove(1)); // X
    act(() => result.current.makeMove(4)); // O
    act(() => result.current.makeMove(2)); // X -> win

    expect(result.current.winner).toBe('X');

    // attempt further move should generate error audit (game ended)
    act(() => result.current.makeMove(5));
    // No change on board 5
    expect(result.current.current.squares[5]).toBeNull();
    consoleSpy.mockRestore();
  });

  test('draw detection when board filled without winner', () => {
    const { result } = renderHook(() => useTicTacToe(), { wrapper: Wrapper });
    // Sequence to achieve a draw
    const seq = [0,1,2,4,3,5,7,6,8]; // results in draw
    seq.forEach(i => act(() => result.current.makeMove(i)));
    expect(result.current.winner).toBeNull();
    expect(result.current.isDraw).toBe(true);
  });

  test('jumpTo with authorization: admin can jump, player cannot', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // As default role "player", jumping should error
    act(() => result.current.jumpTo(0));
    const errByPlayer = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(errByPlayer).toBeTruthy();
    expect(errByPlayer.error).toMatch(/AUTHZ_ERROR/);

    // Change role to admin and try jump again
    act(() => result.current.setCurrentUser({ id: 'user1', role: 'admin' }));
    act(() => result.current.makeMove(0)); // create at least two steps
    act(() => result.current.jumpTo(0));
    expect(result.current.current.moveIndex).toBe(0);
    const readAudit = result.current.events.find(e => e.actionType === 'READ' && e.entity === 'Jump');
    expect(readAudit).toBeTruthy();
    consoleSpy.mockRestore();
  });

  test('resetGame requires reset permission; audit includes signatureMeta and reason', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // player cannot reset -> error
    act(() => result.current.resetGame('because', { signature: 'sigA', reason: 'because' }));
    const errByPlayer = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(errByPlayer).toBeTruthy();
    expect(errByPlayer.error).toMatch(/AUTHZ_ERROR/);

    // switch to admin and reset
    act(() => result.current.setCurrentUser({ id: 'user1', role: 'admin' }));
    act(() => result.current.makeMove(0));
    act(() => result.current.resetGame('reset for test', { signature: 'sig123', reason: 'reset for test' }));

    expect(result.current.history.length).toBe(1);
    expect(result.current.current.squares).toEqual(Array(9).fill(null));

    const upd = result.current.events.find(e => e.actionType === 'UPDATE' && e.entity === 'Reset');
    expect(upd).toBeTruthy();
    expect(upd.reason).toBe('reset for test');
    expect(upd.signatureMeta).toEqual({ signature: 'sig123', reason: 'reset for test' });
    consoleSpy.mockRestore();
  });
});

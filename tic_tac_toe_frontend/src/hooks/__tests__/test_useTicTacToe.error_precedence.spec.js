import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe - error precedence standardization', () => {
  test('after win/draw, further moves yield BUSINESS_RULE Game already ended before other checks', () => {
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
    expect(result.current.winner).toBe('X');

    act(() => result.current.makeMove(2)); // Same index, but game ended should dominate
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);
    consoleSpy.mockRestore();
  });

  test('when game active, occupied-square yields BUSINESS_RULE before index validation', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(8)); // O
    act(() => result.current.makeMove(0)); // occupied triggers BUSINESS_RULE
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(err.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);
    consoleSpy.mockRestore();
  });

  test('unauthorized reset and jump push ERROR audit events with AUTHZ_ERROR prefix', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.resetGame('why', { signature: 'S', reason: 'why' }));
    let err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(err.error).toMatch(/^AUTHZ_ERROR:/i);

    act(() => result.current.jumpTo(0));
    err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(err.error).toMatch(/^AUTHZ_ERROR:/i);
    consoleSpy.mockRestore();
  });
});

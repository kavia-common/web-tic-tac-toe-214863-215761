import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe - extra branch coverage and precedence', () => {
  test('after win/draw any further move is BUSINESS_RULE Game already ended.', () => {
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

    act(() => result.current.makeMove(8)); // should be blocked by Game already ended
    const evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(evt.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);
    consoleSpy.mockRestore();
  });

  test('occupied square check wins over index check while active game', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(8)); // O
    // occupied move
    act(() => result.current.makeMove(0));
    const evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(evt.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);
    consoleSpy.mockRestore();
  });

  test('unauthorized reset/jump pushes AUTHZ_ERROR in audit', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // Player role by default lacks reset/jump
    act(() => result.current.resetGame('some reason', { signature: 'sig', reason: 'some reason' }));
    let evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(evt.error).toMatch(/^AUTHZ_ERROR:/i);

    act(() => result.current.jumpTo(0));
    evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(evt.error).toMatch(/^AUTHZ_ERROR:/i);
    consoleSpy.mockRestore();
  });
});

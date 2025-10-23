import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe - code and message alignment', () => {
  test('occupied square surfaces BUSINESS_RULE with plain message and prefixed audit', () => {
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0));
    act(() => result.current.makeMove(8));
    act(() => result.current.makeMove(0));

    const errorAudit = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(errorAudit.error).toMatch(/^BUSINESS_RULE: Selected square is already occupied\\./);
  });

  test('jump validation surfaces VALIDATION_ERROR for out of range index', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // elevate to admin to bypass authz
    act(() => result.current.setCurrentUser({ id: 'u1', role: 'admin' }));
    act(() => result.current.jumpTo(10)); // invalid range
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(err.error).toMatch(/^VALIDATION_ERROR: Invalid move index for jump\\./);
    consoleSpy.mockRestore();
  });
});

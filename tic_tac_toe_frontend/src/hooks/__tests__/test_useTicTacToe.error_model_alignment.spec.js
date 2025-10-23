import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe - standardized error model and precedence', () => {
  test('post-game move surfaces BUSINESS_RULE: Game already ended.', () => {
    const cspy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    // create a quick win
    act(() => result.current.makeMove(0));
    act(() => result.current.makeMove(3));
    act(() => result.current.makeMove(1));
    act(() => result.current.makeMove(4));
    act(() => result.current.makeMove(2)); // win X

    act(() => result.current.makeMove(2)); // attempt after game end
    const evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(evt.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);
    cspy.mockRestore();
  });

  test('occupied square surfaces BUSINESS_RULE before index validation when game active', () => {
    const cspy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(8)); // O
    act(() => result.current.makeMove(0)); // occupied
    const evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(evt.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);
    cspy.mockRestore();
  });

  test('unauthorized reset and jump produce AUTHZ_ERROR audit error strings', () => {
    const cspy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const hook = useTicTacToe();
      const audit = useAudit();
      return { ...hook, ...audit };
    }, { wrapper: Wrapper });

    act(() => result.current.resetGame('reset reason', { signature: 'sig', reason: 'reset reason' }));
    let evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(evt.error).toMatch(/^AUTHZ_ERROR:/i);

    act(() => result.current.jumpTo(1));
    evt = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(evt.error).toMatch(/^AUTHZ_ERROR:/i);
    cspy.mockRestore();
  });
});

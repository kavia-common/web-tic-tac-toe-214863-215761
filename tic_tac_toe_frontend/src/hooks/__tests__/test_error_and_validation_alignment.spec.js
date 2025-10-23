import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTicTacToe } from '../useTicTacToe';
import { AuditTrailProvider, useAudit } from '../../state/AuditContext';

// PUBLIC_INTERFACE
// Helper provider to ensure context with default role fallback to 'player'
function Wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('Standardized error model and validation order alignment', () => {
  test('BUSINESS_RULE surfaces for post-game and occupied-square before index validation', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // Create a quick win for X: 0,3,1,4,2
    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(3)); // O
    act(() => result.current.makeMove(1)); // X
    act(() => result.current.makeMove(4)); // O
    act(() => result.current.makeMove(2)); // X -> win

    // After game ended, any further move should be BUSINESS_RULE first
    act(() => result.current.makeMove(5));
    const errAfterGame = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(errAfterGame).toBeTruthy();
    expect(errAfterGame.error).toMatch(/^BUSINESS_RULE:\sGame already ended\./i);

    // Fresh hook to test occupied vs index ordering
    const { result: result2 } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // Make an initial valid move and then try to play the same square index (occupied)
    act(() => result2.current.makeMove(0)); // X -> index 0 occupied by X
    act(() => result2.current.makeMove(0)); // same index should be BUSINESS_RULE occupied
    const occupiedErr = result2.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(occupiedErr).toBeTruthy();
    expect(occupiedErr.error).toMatch(/^BUSINESS_RULE:\sSelected square is already occupied\./i);

    consoleSpy.mockRestore();
  });

  test('Standardized error object: assert err.code categories and plain messages are audited with single prefix', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // Trigger a VALIDATION_ERROR: out-of-range index
    act(() => result.current.makeMove(99));
    const vErr = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Move');
    expect(vErr).toBeTruthy();
    // Single prefixed string via formatError
    expect(vErr.error).toMatch(/^VALIDATION_ERROR:\sMove index must be an integer between 0 and 8\./i);

    // Trigger AUTHZ_ERROR by attempting jump as default 'player'
    act(() => result.current.jumpTo(0));
    const aErr = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Jump');
    expect(aErr).toBeTruthy();
    expect(aErr.error).toMatch(/^AUTHZ_ERROR:\s/i);

    consoleSpy.mockRestore();
  });

  test('Provider/wrapper default role is player (unauthorized flows)', () => {
    const { result } = renderHook(() => {
      const ttt = useTicTacToe();
      const audit = useAudit();
      return { ...ttt, ...audit };
    }, { wrapper: Wrapper });

    // Try reset as default player -> should produce AUTHZ error event
    act(() => result.current.resetGame('because', { signature: 'sig', reason: 'because' }));
    const err = result.current.events.find(e => e.actionType === 'ERROR' && e.entity === 'Reset');
    expect(err).toBeTruthy();
    expect(err.error).toMatch(/^AUTHZ_ERROR:\s/i);
  });
});

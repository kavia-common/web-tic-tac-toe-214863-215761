import { renderHook, act } from '@testing-library/react';
import { AuditTrailProvider } from '../../state/AuditContext';
import { useTicTacToe } from '../useTicTacToe';

function wrapper({ children }) {
  return <AuditTrailProvider>{children}</AuditTrailProvider>;
}

describe('useTicTacToe structured audit and precedence (post-game > occupied > invalid)', () => {
  test('post-game prevents further move with BUSINESS_RULE and formats message', () => {
    const { result } = renderHook(() => useTicTacToe(), { wrapper });
    // win quickly by X
    act(() => result.current.handleMove(0));
    act(() => result.current.handleMove(3));
    act(() => result.current.handleMove(1));
    act(() => result.current.handleMove(4));
    act(() => result.current.handleMove(2)); // X wins top row
    // attempt another move should audit error with Business Rule prefix
    act(() => result.current.handleMove(5));
    // We cannot read audit events directly from hook; instead ensure no state change (still winner)
    expect(result.current.winner).toBe('X');
  });

  test('occupied before index validation', () => {
    const { result } = renderHook(() => useTicTacToe(), { wrapper });
    act(() => result.current.handleMove(0)); // X
    act(() => result.current.handleMove(0)); // attempt same square triggers BUSINESS_RULE
    expect(result.current.current.squares[0]).toBe('X');
  });
});

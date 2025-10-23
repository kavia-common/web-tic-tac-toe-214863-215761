import { renderHook, act } from '@testing-library/react';
import useTicTacToe from '../useTicTacToe';

// Goal: Cover lines 92, 122-129, 169 by forcing:
// - index validation error (VALIDATION_ERROR)
// - occupied square (BUSINESS_RULE)
// - post-game action (BUSINESS_RULE: Game already ended.)
// Ensure structured payloads {errorCode, errorMessage} and precedence ordering.

describe('useTicTacToe targeted lines coverage and standardized error model', () => {
  test('index validation triggers VALIDATION_ERROR with structured payload (line 92)', () => {
    const { result } = renderHook(() => useTicTacToe());
    act(() => {
      // Call with invalid index at the hook API
      result.current.handleMove(-1);
    });
    const last = result.current.auditTrail.slice(-1)[0];
    expect(last).toBeTruthy();
    expect(last.error).toEqual({
      errorCode: 'VALIDATION_ERROR',
      errorMessage: expect.stringMatching(/index/i),
    });
    expect(last.message).toMatch(/^Validation Error: /);
  });

  test('occupied and post-game precedence, structured BUSINESS_RULE payloads (lines 122-129, 169)', () => {
    const { result } = renderHook(() => useTicTacToe());
    // Make a quick win for X: 0,1,2 path
    act(() => result.current.handleMove(0)); // X
    act(() => result.current.handleMove(3)); // O
    act(() => result.current.handleMove(1)); // X
    act(() => result.current.handleMove(4)); // O
    act(() => result.current.handleMove(2)); // X wins

    // Post-game attempt should be BUSINESS_RULE "Game already ended."
    act(() => result.current.handleMove(5));
    let last = result.current.auditTrail.slice(-1)[0];
    expect(last.error).toEqual({
      errorCode: 'BUSINESS_RULE',
      errorMessage: 'Game already ended.',
    });
    expect(last.message).toBe('Business Rule: Game already ended.');

    // Occupied square precedence when game is active: restart a new game and try occupied
    act(() => result.current.resetGame());
    act(() => result.current.handleMove(0)); // X
    act(() => result.current.handleMove(0)); // occupied
    last = result.current.auditTrail.slice(-1)[0];
    expect(last.error).toEqual({
      errorCode: 'BUSINESS_RULE',
      errorMessage: 'Selected square is already occupied.',
    });
    expect(last.message).toBe('Business Rule: Selected square is already occupied.');
  });
});

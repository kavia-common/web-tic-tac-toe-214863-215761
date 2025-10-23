/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-LOGIC-001
// User Story: As a user, I want to play Tic Tac Toe with correct rules and history.
// Acceptance Criteria: Alternating turns, winner detection, draw detection, move/jump/reset.
// GxP Impact: YES - validations, audit integration points.
// Risk Level: MEDIUM
// Validation Protocol: VP-LOGIC-001
// ============================================================================
*/

import { useCallback, useMemo, useState } from 'react';
import {
  validateMoveIndex,
  validateSquareAvailable,
  validateAlternation,
  validateGameNotEnded,
} from '../utils/validation';
import { buildAuditRecord } from '../utils/audit';
import { formatError, makeError } from '../utils/error';
import { useAudit } from '../state/AuditContext';
import { hasPermission } from '../utils/accessControl';

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/**
 * Determine winner and line.
 * @param {Array<string|null>} squares
 * @returns {{winner:string|null, line:number[]|null}}
 */
function calculateWinner(squares) {
  for (const [a,b,c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a,b,c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * PUBLIC_INTERFACE
 * useTicTacToe
 * This is a public hook.
 * Manages board state, history, winner/draw status; exposes validated operations.
 *
 * @returns {{
 *   history: Array<{squares: Array<string|null>, moveIndex: number, nextPlayer: string}>,
 *   current: { squares: Array<string|null>, moveIndex: number, nextPlayer: string },
 *   winner: string|null,
 *   isDraw: boolean,
 *   makeMove: (index:number)=>void,
 *   resetGame: (reason:string, signatureMeta:{signature:string, reason:string})=>void,
 *   jumpTo: (moveIndex:number)=>void
 * }}
 */
export function useTicTacToe() {
  const { appendAuditEvent, currentUser } = useAudit();
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), moveIndex: 0, nextPlayer: 'X' }]);
  const [step, setStep] = useState(0);

  const current = history[step];
  const { winner } = useMemo(() => calculateWinner(current.squares), [current.squares]);
  const isDraw = useMemo(
    () => !winner && current.squares.every(Boolean),
    [winner, current.squares]
  );

  const auditWrap = useCallback((actionType, entity, beforeState, afterState, extra = {}) => {
    const record = buildAuditRecord({
      userId: currentUser?.id || 'anonymous',
      userRole: currentUser?.role || 'player',
      actionType,
      entity,
      beforeState,
      afterState,
      ...extra
    });
    appendAuditEvent(record);
  }, [appendAuditEvent, currentUser]);

  const makeMove = useCallback((index) => {
    const before = { ...current, historyLength: history.length, step };
    try {
      // Permissions first
      if (!hasPermission(currentUser?.role, 'move')) {
        throw makeError('AUTHZ_ERROR', 'User lacks permission to move.');
      }

      // Harmonized precedence:
      // 1) If game ended -> BUSINESS_RULE 'Game already ended.'
      if (winner || isDraw) {
        throw makeError('BUSINESS_RULE', 'Game already ended.');
      }

      // 2) If square occupied during active game -> BUSINESS_RULE 'Selected square is already occupied.'
      if (index != null && current.squares?.[index] != null) {
        throw makeError('BUSINESS_RULE', 'Selected square is already occupied.');
      }

      // 3) Then validate index/range -> VALIDATION_ERROR via validator
      validateMoveIndex(index);

      // 4) Alternation as BUSINESS_RULE
      validateAlternation(current.nextPlayer, current, step);

      const nextSquares = current.squares.slice();
      nextSquares[index] = current.nextPlayer;
      const next = {
        squares: nextSquares,
        moveIndex: step + 1,
        nextPlayer: current.nextPlayer === 'X' ? 'O' : 'X',
      };
      const newHistory = history.slice(0, step + 1).concat(next);
      setHistory(newHistory);
      setStep(step + 1);
      auditWrap('UPDATE', 'Move', before, { ...next, historyLength: newHistory.length, step: step + 1 }, { reason: 'Make move' });
    } catch (err) {
      // Normalize error: ensure single prefix and code/message separation
      let e;
      if (err && err.code) {
        e = err;
      } else {
        const msg = String(err && err.message ? err.message : err);
        if (/permission|unauthorized|forbidden/i.test(msg)) {
          e = makeError('AUTHZ_ERROR', msg);
        } else if (/index|range|invalid|out of/i.test(msg)) {
          e = makeError('VALIDATION_ERROR', msg);
        } else {
          e = makeError('BUSINESS_RULE', msg);
        }
      }
      // Push ERROR audit with structured payload
      auditWrap('ERROR', 'Move', before, before, {
        error: formatError(e),
        errorCode: e.code || 'ERROR',
        errorMessage: e?.message || 'Unknown error'
      });
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [current, step, history, auditWrap, winner, isDraw, currentUser]);

  const resetGame = useCallback((reason, signatureMeta) => {
    const before = { history, step };
    try {
      if (!hasPermission(currentUser?.role, 'reset')) {
        throw makeError('AUTHZ_ERROR', 'User lacks permission to reset.');
      }
      // validate signature in UI; here we only ensure objects are present
      const next = { squares: Array(9).fill(null), moveIndex: 0, nextPlayer: 'X' };
      setHistory([next]);
      setStep(0);
      auditWrap('UPDATE', 'Reset', before, { history: [next], step: 0 }, {
        reason: reason || 'Reset game',
        signatureMeta
      });
    } catch (err) {
      // Ensure unauthorized reset produces AUTHZ_ERROR; otherwise default business rule
      let e;
      if (err && err.code) {
        e = err;
      } else {
        const msg = String(err && err.message ? err.message : err);
        e = /permission|unauthorized|forbidden/i.test(msg)
          ? makeError('AUTHZ_ERROR', msg)
          : makeError('BUSINESS_RULE', msg);
      }
      // Push ERROR audit with AUTHZ_ERROR or other code and structured payloads
      auditWrap('ERROR', 'Reset', before, before, {
        error: formatError(e),
        errorCode: e.code || 'ERROR',
        errorMessage: e?.message || 'Unknown error'
      });
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [history, step, auditWrap, currentUser]);

  const jumpTo = useCallback((moveIndex) => {
    const before = { historyLength: history.length, step };
    try {
      if (!hasPermission(currentUser?.role, 'jump')) {
        throw makeError('AUTHZ_ERROR', 'User lacks permission to jump.');
      }
      if (typeof moveIndex !== 'number' || moveIndex < 0 || moveIndex >= history.length) {
        // Standardize validation category
        throw makeError('VALIDATION_ERROR', 'Invalid move index for jump.');
      }
      setStep(moveIndex);
      auditWrap('READ', 'Jump', before, { step: moveIndex }, { reason: `Jump to ${moveIndex}` });
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      const isAuth = err && err.code === 'AUTHZ_ERROR';
      const e = isAuth ? err : makeError(/invalid|range|index|out of/i.test(msg) ? 'VALIDATION_ERROR' : 'BUSINESS_RULE', msg);
      // Push structured ERROR audit payload
      auditWrap('ERROR', 'Jump', before, before, {
        error: formatError(e),
        errorCode: e.code || 'ERROR',
        errorMessage: e?.message || 'Unknown error'
      });
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [history, step, auditWrap, currentUser]);

  // Backward/forward compatible alias exports so tests can call handleMove()
  const handleMove = makeMove;
  const reset = resetGame;

  return {
    history,
    current,
    winner,
    isDraw,
    makeMove,
    resetGame,
    jumpTo,
    // additional aliases used by legacy/new tests
    handleMove,
    reset
  };
}

// Maintain both named and default exports for compatibility with tests
export { useTicTacToe as default };

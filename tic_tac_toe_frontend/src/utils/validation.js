/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-VAL-001
// User Story: Validate all user inputs and business rules for the game.
// Acceptance Criteria: Index range, availability, alternation, game not ended, signature non-empty.
// GxP Impact: YES - data integrity and correctness.
// Risk Level: HIGH
// Validation Protocol: VP-VAL-001
// ============================================================================
*/

import { makeError } from './error';

/**
 * PUBLIC_INTERFACE
 * validateMoveIndex
 * This is a public function.
 * Ensures index is a number 0..8
 * @param {number} index
 */
export function validateMoveIndex(index) {
  if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index > 8) {
    throw makeError('VALIDATION_ERROR', 'Move index must be an integer between 0 and 8.');
  }
}

/**
 * PUBLIC_INTERFACE
 * validateSquareAvailable
 * This is a public function.
 * Ensures target square is empty
 * @param {Array<string|null>} squares
 * @param {number} index
 */
export function validateSquareAvailable(squares, index) {
  if (squares[index]) {
    throw makeError('BUSINESS_RULE', 'Selected square is already occupied.');
  }
}

/**
 * PUBLIC_INTERFACE
 * validateAlternation
 * This is a public function.
 * Ensures turn alternation is respected
 * @param {string} expectedPlayer
 * @param {{squares:Array<string|null>}} current
 * @param {number} step
 */
export function validateAlternation(expectedPlayer, current, step) {
  const xCount = current.squares.filter((v) => v === 'X').length;
  const oCount = current.squares.filter((v) => v === 'O').length;
  const shouldBe = xCount === oCount ? 'X' : 'O';
  if (expectedPlayer !== shouldBe || expectedPlayer !== (step % 2 === 0 ? 'X' : 'O')) {
    throw makeError('BUSINESS_RULE', 'Turn alternation rule violated.');
  }
}

/**
 * PUBLIC_INTERFACE
 * validateGameNotEnded
 * This is a public function.
 * Ensures game not already ended
 * @param {string|null} winner
 * @param {boolean} isDraw
 */
export function validateGameNotEnded(winner, isDraw) {
  if (winner || isDraw) {
    throw makeError('BUSINESS_RULE', 'Game already ended.');
  }
}

/**
 * PUBLIC_INTERFACE
 * validateSignature
 * This is a public function.
 * Validates signature and reason non-empty
 * @param {string} signature
 * @param {string} reason
 * @returns {{valid:boolean, message?:string}}
 */
export function validateSignature(signature, reason) {
  if (!signature || typeof signature !== 'string' || signature.trim().length < 2) {
    return { valid: false, message: 'Signature required (min 2 chars).' };
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    return { valid: false, message: 'Reason required (min 3 chars).' };
  }
  return { valid: true };
}

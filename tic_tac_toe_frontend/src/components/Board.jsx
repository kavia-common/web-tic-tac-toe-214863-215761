/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-UI-002
// User Story: As a player, I want to see and interact with a 3x3 grid of squares.
// Acceptance Criteria: 3x3 layout, keyboard accessible, passes click actions up.
// GxP Impact: YES - reflects validated state changes.
// Risk Level: LOW
// Validation Protocol: VP-UI-002
// ============================================================================
*/

import React from 'react';
import Square from './Square';

/**
 * PUBLIC_INTERFACE
 * Board
 * This is a public component.
 * Renders the 3x3 board with squares.
 *
 * @param {Object} props
 * @param {Array<string|null>} props.squares - Array of 9 values for the board
 * @param {function(number):void} props.onSquareClick - Handler when a square is clicked
 * @param {boolean} [props.disabled] - Disable all squares
 * @returns {JSX.Element}
 */
function Board({ squares, onSquareClick, disabled = false }) {
  return (
    <div
      className="ttt-board"
      role="grid"
      aria-label="Tic Tac Toe Board"
      aria-rowcount={3}
      aria-colcount={3}
    >
      {squares.map((val, idx) => (
        <div
          className="ttt-cell"
          role="gridcell"
          aria-rowindex={Math.floor(idx / 3) + 1}
          aria-colindex={(idx % 3) + 1}
          key={idx}
        >
          <Square
            value={val}
            onClick={() => onSquareClick(idx)}
            index={idx}
            disabled={disabled || Boolean(val)}
          />
        </div>
      ))}
    </div>
  );
}

export default Board;

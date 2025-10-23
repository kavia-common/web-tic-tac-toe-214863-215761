//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-UI-001
// User Story: As a player, I want to select a square so that I can make a move.
// Acceptance Criteria: Button is accessible via keyboard, shows value X/O, emits onClick.
// GxP Impact: YES - user input to game state must be properly validated.
// Risk Level: LOW
// Validation Protocol: VP-UI-001
// ============================================================================
//
// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================
// React 18.2.0 (as per CRA template)
// ============================================================================

import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Square
 * This is a public component.
 * Renders a single Tic Tac Toe square with accessibility and ARIA attributes.
 *
 * @param {Object} props - Component props
 * @param {string|null} props.value - The value to display in the square ("X", "O", or null)
 * @param {function} props.onClick - Click handler for the square
 * @param {number} props.index - Index of the square (0-8)
 * @param {boolean} [props.disabled] - Whether the square is disabled
 * @returns {JSX.Element} A button representing a square
 */
function Square({ value, onClick, index, disabled = false }) {
  // Accessibility: role button, tabIndex, aria-pressed
  return (
    <button
      type="button"
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Square ${index + 1}${value ? ` occupied by ${value}` : ' empty'}`}
      aria-pressed={false}
      tabIndex={0}
      data-index={index}
      data-testid={`square-${index}`}
    >
      {value}
    </button>
  );
}

export default Square;

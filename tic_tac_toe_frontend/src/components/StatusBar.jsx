/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-UI-003
// User Story: As a player, I want to see current status (turn, winner, draw).
// Acceptance Criteria: Shows next player or winner/draw, accessible.
// GxP Impact: YES - communicates validated state.
// Risk Level: LOW
// Validation Protocol: VP-UI-003
// ============================================================================
*/

import React from 'react';

/**
 * PUBLIC_INTERFACE
 * StatusBar
 * This is a public component.
 * Shows current game status including current player, winner, or draw indicators.
 *
 * @param {Object} props
 * @param {string} props.statusText - The status text to display
 * @returns {JSX.Element}
 */
function StatusBar({ statusText }) {
  return (
    <div className="ttt-status" role="status" aria-live="polite">
      {statusText}
    </div>
  );
}

export default StatusBar;

/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-UI-004
// User Story: As a user, I want to reset game, navigate history, and export audit logs as permitted.
// Acceptance Criteria: Buttons provided with RBAC enforced externally and via disabled state.
// GxP Impact: YES - critical operations have signature gating and auditing.
// Risk Level: MEDIUM
// Validation Protocol: VP-UI-004
// ============================================================================
*/

import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Controls
 * This is a public component.
 * Provides control buttons for critical actions.
 *
 * @param {Object} props
 * @param {function():void} props.onReset - Trigger reset (signature handled externally)
 * @param {function(number):void} props.onJump - Jump to a specific move index
 * @param {Array<string>} props.historyLabels - Labels for each history state
 * @param {function():void} props.onExportAudit - Trigger audit export
 * @param {Object} props.permissions - RBAC info for enabling/disabling controls
 * @returns {JSX.Element}
 */
function Controls({ onReset, onJump, historyLabels, onExportAudit, permissions }) {
  return (
    <div className="ttt-controls" aria-label="Game Controls">
      <div className="ttt-control-row">
        <button
          className="btn"
          type="button"
          onClick={onReset}
          disabled={!permissions.canReset}
          aria-disabled={!permissions.canReset}
          aria-label="Reset game"
          data-testid="btn-reset-game"
        >
          Reset
        </button>
        <button
          className="btn"
          type="button"
          onClick={onExportAudit}
          disabled={!permissions.canExport}
          aria-disabled={!permissions.canExport}
          aria-label="Export audit trail"
          data-testid="btn-export-audit"
        >
          Export Audit
        </button>
      </div>
      <div className="ttt-history" aria-label="Move History">
        {historyLabels.map((label, idx) => (
          <button
            key={idx}
            className="btn btn-small"
            type="button"
            onClick={() => onJump(idx)}
            disabled={!permissions.canJump}
            aria-disabled={!permissions.canJump}
            aria-label={`Jump to move ${idx}`}
            data-testid={`btn-jump-${idx}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Controls;

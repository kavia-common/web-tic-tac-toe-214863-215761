/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-AUD-UI-001
// User Story: As an auditor, I want to view the audit trail in real-time.
// Acceptance Criteria: List audit entries with timestamp, user, action, entity.
// GxP Impact: YES - audit visibility.
// Risk Level: MEDIUM
// Validation Protocol: VP-AUD-UI-001
// ============================================================================
*/

import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AuditTrailPanel
 * This is a public component.
 * Shows the list of audit trail events with essential metadata.
 *
 * @param {Object} props
 * @param {Array<Object>} props.events - Audit events to render
 * @returns {JSX.Element}
 */
function AuditTrailPanel({ events }) {
  return (
    <section className="ttt-audit-panel" aria-label="Audit Trail" role="region" data-testid="audit-panel">
      <h2 className="panel-title">Audit Trail</h2>
      <ul className="audit-list">
        {events.map((evt, idx) => (
          <li key={evt.correlationId || idx} className="audit-item">
            <div className="audit-meta">
              <span className="audit-time">{evt.timestamp}</span>
              <span className="audit-user">{evt.userId} ({evt.userRole})</span>
              <span className={`audit-action audit-${evt.actionType?.toLowerCase?.() || 'info'}`}>
                {evt.actionType}
              </span>
              <span className="audit-entity">{evt.entity}</span>
            </div>
            {evt.reason ? <div className="audit-reason">Reason: {evt.reason}</div> : null}
            {evt.error ? (
              <div className="audit-error" data-testid="audit-error-text">
                <span data-testid="audit-error-fulltext">Error: {evt.error}</span>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AuditTrailPanel;

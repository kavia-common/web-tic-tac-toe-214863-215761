/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-AUD-REC-001
// User Story: Build consistent audit record entries.
// Acceptance Criteria: Contains user, role, ISO timestamp, actionType, entity, before/after, reason, signature metadata, correlationId, version.
// GxP Impact: YES - ALCOA+ compliance.
// Risk Level: HIGH
// Validation Protocol: VP-AUD-REC-001
// ============================================================================
*/

function isoNow() {
  return new Date().toISOString();
}

function genCorrelationId() {
  // Simple correlation id using timestamp and random suffix
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * PUBLIC_INTERFACE
 * buildAuditRecord
 * This is a public function.
 * Creates a standardized audit record.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {'player'|'auditor'|'admin'} params.userRole
 * @param {'CREATE'|'READ'|'UPDATE'|'DELETE'|'ERROR'} params.actionType
 * @param {string} params.entity
 * @param {any} params.beforeState
 * @param {any} params.afterState
 * @param {string} [params.reason]
 * @param {{signature?:string, reason?:string}} [params.signatureMeta]
 * @param {string} [params.correlationId]
 * @param {string} [params.version]
 * @param {string} [params.error]
 * @returns {Object}
 */
export function buildAuditRecord(params) {
  return {
    userId: params.userId,
    userRole: params.userRole,
    timestamp: isoNow(),
    actionType: params.actionType,
    entity: params.entity,
    beforeState: params.beforeState,
    afterState: params.afterState,
    reason: params.reason || '',
    signatureMeta: params.signatureMeta || null,
    error: params.error || null,
    correlationId: params.correlationId || genCorrelationId(),
    version: params.version || '1.0.0',
  };
}

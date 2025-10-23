/*
 // ============================================================================
 // REQUIREMENT TRACEABILITY
 // ============================================================================
 // Requirement ID: REQ-ERR-001
 // User Story: Standardize error objects and formatting for audit logs and UI.
 // Acceptance Criteria: Errors carry code and message; formatter returns readable string.
 // GxP Impact: YES - accurate error auditing.
 // Risk Level: MEDIUM
 // Validation Protocol: VP-ERR-001
 // ============================================================================
 */

/**
 * PUBLIC_INTERFACE
 * normalizeErrorCode
 * This is a public function.
 * Normalizes a raw error code/string to one of:
 * - VALIDATION_ERROR
 * - BUSINESS_RULE
 * - AUTHZ_ERROR
 * - ERROR (fallback)
 * @param {string} raw
 * @returns {'VALIDATION_ERROR'|'BUSINESS_RULE'|'AUTHZ_ERROR'|'ERROR'}
 */
export function normalizeErrorCode(raw) {
  const c = String(raw || '').toUpperCase();
  if (c.includes('VALIDATION')) return 'VALIDATION_ERROR';
  if (c.includes('BUSINESS')) return 'BUSINESS_RULE';
  if (c.includes('AUTHZ') || c.includes('UNAUTHORIZED') || c.includes('FORBIDDEN')) return 'AUTHZ_ERROR';
  return c || 'ERROR';
}

/**
 * PUBLIC_INTERFACE
 * makeError
 * This is a public function.
 * Constructs a standardized error with code/message.
 * Normalizes common categories to expected values.
 * @param {'VALIDATION_ERROR'|'BUSINESS_RULE'|'AUTHZ_ERROR'|string} code
 * @param {string} message
 * @returns {Error & {code:string}}
 */
export function makeError(code, message) {
  const normalized = normalizeErrorCode(code);
  const baseMessage = String(message || '');
  // Create Error with plain message; code is carried separately on the object.
  // Avoid embedding the code in the message so tests can assert err.code and plain messages.
  const e = new Error(baseMessage);
  // @ts-ignore
  e.code = normalized;
  return e;
}

/**
 * PUBLIC_INTERFACE
 * formatError
 * This is a public function.
 * Formats error to readable string "CODE: message".
 * Ensures code normalization consistent with makeError for thrown non-standard errors.
 * Enforces single prefix and plain message content.
 * @param {any} err
 * @returns {string}
 */
export function formatError(err) {
  // For null/undefined explicitly return UNKNOWN prefix per spec
  if (err === null || typeof err === 'undefined') {
    return 'UNKNOWN: Unknown error';
  }
  const code = normalizeErrorCode(err.code || 'ERROR');

  // Determine a raw message string
  let rawMessage = '';
  if (err && typeof err.message === 'string') {
    rawMessage = err.message;
  } else if (typeof err === 'string') {
    rawMessage = err;
  } else {
    try {
      rawMessage = JSON.stringify(err);
    } catch {
      rawMessage = String(err);
    }
  }

  // Strip any pre-existing CODE: prefix from the message to avoid double prefixing
  const prefixMatch = String(rawMessage).match(/^([A-Z_]+):\s*(.*)$/);
  const message = prefixMatch ? (prefixMatch[2] || '') : rawMessage;

  // Ensure we only surface a plain message and not include error code in the message
  const finalMessage = message && message.trim().length ? message.trim() : 'Unknown error';
  return `${code}: ${finalMessage}`;
}

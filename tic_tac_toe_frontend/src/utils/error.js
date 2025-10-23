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
 * makeError
 * This is a public function.
 * Constructs a standardized error with code/message.
 * @param {string} code
 * @param {string} message
 * @returns {Error & {code:string}}
 */
export function makeError(code, message) {
  const e = new Error(message);
  // @ts-ignore
  e.code = code;
  return e;
}

/**
 * PUBLIC_INTERFACE
 * formatError
 * This is a public function.
 * Formats error to readable string "CODE: message".
 * @param {any} err
 * @returns {string}
 */
export function formatError(err) {
  if (!err) return 'UNKNOWN: Unknown error';
  const code = err.code || 'ERROR';
  const message = err.message || String(err);
  return `${code}: ${message}`;
}

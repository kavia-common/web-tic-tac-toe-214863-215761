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
 * Strip existing leading PREFIX: from a message string to avoid double-prefixing.
 * @param {string} msg
 * @returns {string}
 */
function stripExistingPrefix(msg) {
  if (!msg) return '';
  const m = String(msg).match(/^([A-Z_]+):\s*(.*)$/);
  return m ? (m[2] || '') : msg;
}

/**
 * PUBLIC_INTERFACE
 * normalizeError
 * This is a public function.
 * Normalize any input into a structured error payload { errorCode, errorMessage }.
 * - Strings become UNKNOWN with stripped prefix
 * - null/undefined -> UNKNOWN: Unknown error
 * - Errors with code/message are normalized and message is de-prefixed
 * @param {any} input
 * @returns {{ errorCode: 'VALIDATION_ERROR'|'BUSINESS_RULE'|'AUTHZ_ERROR'|'UNKNOWN'|'ERROR', errorMessage: string }}
 */
export function normalizeError(input) {
  if (input === null || typeof input === 'undefined') {
    return { errorCode: 'UNKNOWN', errorMessage: 'Unknown error' };
  }
  if (typeof input === 'string') {
    return { errorCode: 'UNKNOWN', errorMessage: stripExistingPrefix(input).trim() || 'Unknown error' };
  }
  // Likely Error-like
  const code = normalizeErrorCode(input?.code || '');
  const message =
    typeof input?.message === 'string'
      ? stripExistingPrefix(input.message).trim() || 'Unknown error'
      : 'Unknown error';
  // Preserve UNKNOWN when nothing is identifiable
  if (!['BUSINESS_RULE', 'VALIDATION_ERROR', 'AUTHZ_ERROR'].includes(code)) {
    if (!input?.code) {
      return { errorCode: 'ERROR', errorMessage: message };
    }
  }
  return { errorCode: code || 'ERROR', errorMessage: message };
}

/**
 * PUBLIC_INTERFACE
 * formatError
 * This is a public function.
 * Formats structured error into exact user-facing strings:
 *  - 'Business Rule: …' for BUSINESS_RULE
 *  - 'Validation Error: …' for VALIDATION_ERROR
 *  - 'Authorization Error: …' for AUTHZ_ERROR
 *  - 'Unknown Error: …' for UNKNOWN or null
 * Never JSON-stringify in user-facing strings, and strip any existing prefixes.
 * Accepts either raw value or an object with errorCode/errorMessage, or Error-like.
 * @param {any} input
 * @returns {string}
 */
export function formatError(input) {
  const normalized =
    input && typeof input === 'object' && 'errorCode' in input && 'errorMessage' in input
      ? { errorCode: input.errorCode, errorMessage: stripExistingPrefix(input.errorMessage) }
      : normalizeError(input);

  const code = normalized.errorCode || 'UNKNOWN';
  const msg = stripExistingPrefix(normalized.errorMessage || '').trim() || 'Unknown error';

  switch (code) {
    case 'BUSINESS_RULE':
      return `Business Rule: ${msg}`;
    case 'VALIDATION_ERROR':
      return `Validation Error: ${msg}`;
    case 'AUTHZ_ERROR':
      return `Authorization Error: ${msg}`;
    case 'UNKNOWN':
      return `Unknown Error: ${msg}`;
    default:
      // For ERROR or any other unmapped codes, treat as Unknown
      return `Unknown Error: ${msg}`;
  }
}

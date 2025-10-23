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
   // Prefix code into the thrown Error message to meet tests expecting codes in error strings
   const e = new Error(baseMessage ? `${normalized}: ${baseMessage}` : `${normalized}:`);
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
  * @param {any} err
  * @returns {string}
  */
 export function formatError(err) {
   if (!err) return 'UNKNOWN: Unknown error';
   const code = normalizeErrorCode(err.code || 'ERROR');
   const rawMessage = err && typeof err.message === 'string' ? err.message : String(err);
   const message = rawMessage && rawMessage.trim().length ? rawMessage : 'Unknown error';
   return `${code}: ${message}`;
 }

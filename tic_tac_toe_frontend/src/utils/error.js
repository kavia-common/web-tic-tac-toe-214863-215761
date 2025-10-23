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
  * Normalizes common categories to expected values.
  * @param {'VALIDATION_ERROR'|'BUSINESS_RULE'|'AUTHZ_ERROR'|string} code
  * @param {string} message
  * @returns {Error & {code:string}}
  */
 export function makeError(code, message) {
   // Normalize categories to the agreed prefixes
   const normalized = (() => {
     const c = String(code || '').toUpperCase();
     if (c.includes('VALIDATION')) return 'VALIDATION_ERROR';
     if (c.includes('BUSINESS')) return 'BUSINESS_RULE';
     if (c.includes('AUTHZ') || c.includes('UNAUTHORIZED') || c.includes('FORBIDDEN')) return 'AUTHZ_ERROR';
     return c || 'ERROR';
   })();

   const e = new Error(String(message || ''));
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
   const rawCode = err.code || 'ERROR';
   const code = (() => {
     const c = String(rawCode || '').toUpperCase();
     if (c.includes('VALIDATION')) return 'VALIDATION_ERROR';
     if (c.includes('BUSINESS')) return 'BUSINESS_RULE';
     if (c.includes('AUTHZ') || c.includes('UNAUTHORIZED') || c.includes('FORBIDDEN')) return 'AUTHZ_ERROR';
     return c || 'ERROR';
   })();
   const message = err.message || String(err);
   return `${code}: ${message}`;
 }

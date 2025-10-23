/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-RBAC-001
// User Story: Enforce role-based access control for operations.
// Acceptance Criteria: Player can move; admin can reset/jump; auditor can export audit.
// GxP Impact: YES - security and least privilege.
// Risk Level: MEDIUM
// Validation Protocol: VP-RBAC-001
// ============================================================================
*/

/**
 * PUBLIC_INTERFACE
 * hasPermission
 * This is a public function.
 * Checks permission for a role and operation.
 *
 * @param {'player'|'auditor'|'admin'} role
 * @param {'move'|'reset'|'jump'|'export'} operation
 * @returns {boolean}
 */
export function hasPermission(role, operation) {
  const matrix = {
    player: { move: true, reset: false, jump: false, export: false },
    auditor: { move: false, reset: false, jump: false, export: true },
    admin: { move: true, reset: true, jump: true, export: true },
  };
  const r = role || 'player';
  return Boolean(matrix[r] && matrix[r][operation]);
}

/**
 * PUBLIC_INTERFACE
 * permissionsForRole
 * This is a public function.
 * Returns object of permissions booleans for UI enabling.
 *
 * @param {'player'|'auditor'|'admin'} role
 * @returns {{canMove:boolean, canReset:boolean, canJump:boolean, canExport:boolean}}
 */
export function permissionsForRole(role) {
  return {
    canMove: hasPermission(role, 'move'),
    canReset: hasPermission(role, 'reset'),
    canJump: hasPermission(role, 'jump'),
    canExport: hasPermission(role, 'export'),
  };
}

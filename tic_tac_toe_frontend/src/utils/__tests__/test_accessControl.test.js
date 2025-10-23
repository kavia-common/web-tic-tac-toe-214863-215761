import { hasPermission, permissionsForRole } from '../accessControl';

describe('RBAC utilities', () => {
  test('hasPermission matrix', () => {
    expect(hasPermission('player', 'move')).toBe(true);
    expect(hasPermission('player', 'reset')).toBe(false);
    expect(hasPermission('auditor', 'export')).toBe(true);
    expect(hasPermission('auditor', 'move')).toBe(false);
    expect(hasPermission('admin', 'reset')).toBe(true);
    expect(hasPermission('admin', 'jump')).toBe(true);
  });

  test('permissionsForRole shape', () => {
    expect(permissionsForRole('player')).toEqual({
      canMove: true, canReset: false, canJump: false, canExport: false
    });
    expect(permissionsForRole('auditor')).toEqual({
      canMove: false, canReset: false, canJump: false, canExport: true
    });
    expect(permissionsForRole('admin')).toEqual({
      canMove: true, canReset: true, canJump: true, canExport: true
    });
  });

  test('undefined role (unauthorized) defaults to player permissions', () => {
    expect(permissionsForRole(undefined)).toEqual({
      canMove: true, canReset: false, canJump: false, canExport: false
    });
    expect(hasPermission(undefined, 'move')).toBe(true);
  });
});

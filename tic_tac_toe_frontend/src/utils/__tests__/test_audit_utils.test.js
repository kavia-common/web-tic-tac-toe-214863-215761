import { buildAuditRecord } from '../audit';

describe('buildAuditRecord', () => {
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-01T00:00:00.000Z');
  });
  afterEach(() => jest.restoreAllMocks());

  test('creates record with ISO timestamp, correlationId, version', () => {
    const rec = buildAuditRecord({
      userId: 'u1',
      userRole: 'admin',
      actionType: 'UPDATE',
      entity: 'Reset',
      beforeState: { a: 1 },
      afterState: { a: 0 },
      reason: 'reset',
      signatureMeta: { signature: 'sig1', reason: 'reset' }
    });
    expect(rec.timestamp).toBe('2025-01-01T00:00:00.000Z');
    expect(rec.userId).toBe('u1');
    expect(rec.userRole).toBe('admin');
    expect(rec.entity).toBe('Reset');
    expect(rec.reason).toBe('reset');
    expect(rec.signatureMeta).toEqual({ signature: 'sig1', reason: 'reset' });
    expect(typeof rec.correlationId).toBe('string');
    expect(rec.correlationId).toMatch(/^corr-/);
    expect(rec.version).toBe('1.0.0');
  });
});

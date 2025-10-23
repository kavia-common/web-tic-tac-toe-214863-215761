import { renderHook, act } from '@testing-library/react';
import { useAuditTrail } from '../useAuditTrail';
import { buildAuditRecord } from '../../utils/audit';

describe('useAuditTrail hook', () => {
  beforeEach(() => {
    // isolate storage between tests
    window.localStorage.clear();
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes from localStorage if present', () => {
    const preset = [{ id: 1, timestamp: 'X' }];
    window.localStorage.setItem('ttt_audit_events_v1', JSON.stringify(preset));
    const { result } = renderHook(() => useAuditTrail());
    expect(result.current.events).toEqual(preset);
  });

  test('append adds event and persists to localStorage', () => {
    const { result } = renderHook(() => useAuditTrail());
    const evt = buildAuditRecord({
      userId: 'u1',
      userRole: 'player',
      actionType: 'CREATE',
      entity: 'Test',
      beforeState: null,
      afterState: { ok: true },
      reason: 'unit test'
    });

    act(() => result.current.append(evt));
    expect(result.current.events.length).toBe(1);

    const stored = JSON.parse(window.localStorage.getItem('ttt_audit_events_v1') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0]).toMatchObject({
      userId: 'u1',
      userRole: 'player',
      actionType: 'CREATE',
      entity: 'Test',
      reason: 'unit test',
      timestamp: '2025-01-01T00:00:00.000Z'
    });
    // Ensure correlationId exists and looks like corr-...
    expect(typeof stored[0].correlationId).toBe('string');
    expect(stored[0].correlationId).toMatch(/^corr-/);
  });

  test('clear removes all events and persists', () => {
    const { result } = renderHook(() => useAuditTrail());
    act(() => result.current.append({ a: 1 }));
    expect(result.current.events.length).toBe(1);
    act(() => result.current.clear());
    expect(result.current.events.length).toBe(0);

    const stored = JSON.parse(window.localStorage.getItem('ttt_audit_events_v1') || '[]');
    expect(stored.length).toBe(0);
  });
});

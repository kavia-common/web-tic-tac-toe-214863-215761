/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-AUD-001
// User Story: As a system, I need to record audit events with persistence.
// Acceptance Criteria: Append events, list events, persist to localStorage.
// GxP Impact: YES - enduring, contemporaneous audit.
// Risk Level: MEDIUM
// Validation Protocol: VP-AUD-001
// ============================================================================
*/

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ttt_audit_events_v1';

/**
 * PUBLIC_INTERFACE
 * useAuditTrail
 * This is a public hook.
 * Manages audit trail in memory with localStorage persistence.
 *
 * @returns {{
 *  events: Array<Object>,
 *  append: (event:Object)=>void,
 *  clear: ()=>void
 * }}
 */
export function useAuditTrail() {
  const [events, setEvents] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore storage errors
    }
  }, [events]);

  const append = useCallback((event) => {
    setEvents((prev) => prev.concat(event));
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, append, clear };
}

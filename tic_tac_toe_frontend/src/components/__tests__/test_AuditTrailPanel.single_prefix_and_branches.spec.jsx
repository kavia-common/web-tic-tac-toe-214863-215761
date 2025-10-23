import React from 'react';
import { render, screen } from '@testing-library/react';
import AuditTrailPanel from '../AuditTrailPanel';

describe('AuditTrailPanel - single-prefixed error rendering and branches', () => {
  test('renders optional reason and single-prefixed error under panel region', () => {
    const events = [
      {
        timestamp: '2025-06-01T00:00:00.000Z',
        userId: 'auditor1',
        userRole: 'auditor',
        actionType: 'READ',
        entity: 'AuditTrail',
        reason: 'Export audit trail'
      },
      {
        timestamp: '2025-06-01T00:00:05.000Z',
        userId: 'u1',
        userRole: 'player',
        actionType: 'ERROR',
        entity: 'Move',
        error: 'BUSINESS_RULE: Selected square is already occupied.',
      }
    ];
    const { container } = render(<AuditTrailPanel events={events} />);

    const region = screen.getByRole('region', { name: /Audit Trail/i });
    expect(region).toBeInTheDocument();
    // Less brittle: container-level text assertion
    expect(region).toHaveTextContent(/Export audit trail/i);
    expect(region).toHaveTextContent(/Error:\s*BUSINESS_RULE:\s*Selected square is already occupied\./i);
    // Ensure no double prefix present
    const matches = region.textContent.match(/BUSINESS_RULE:/g) || [];
    expect(matches.length).toBe(1);
  });
});

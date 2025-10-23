import React from 'react';
import { render, screen, within } from '@testing-library/react';
import AuditTrailPanel from '../AuditTrailPanel';

describe('AuditTrailPanel - branch coverage', () => {
  test('renders events with optional reason and error branches', () => {
    const events = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        userId: 'u1',
        userRole: 'player',
        actionType: 'UPDATE',
        entity: 'Move',
        reason: 'Make move',
      },
      {
        timestamp: '2025-01-01T00:00:01.000Z',
        userId: 'u1',
        userRole: 'player',
        actionType: 'ERROR',
        entity: 'Move',
        error: 'BUSINESS_RULE: Selected square is already occupied.',
      },
    ];

    const { container } = render(<AuditTrailPanel events={events} />);

    // Use container-scoped queries to avoid text fragmentation and ambiguity
    const panel = screen.getByRole('region', { name: /Audit Trail/i });
    expect(panel).toBeInTheDocument();

    // First event shows reason but not error
    expect(within(panel).getByText('2025-01-01T00:00:00.000Z')).toBeInTheDocument();
    // user and role appear together in a single element <span class="audit-user">u1 (player)</span>
    expect(within(panel).getAllByText(/u1 \(player\)/i).length).toBeGreaterThanOrEqual(1);
    expect(within(panel).getAllByText(/Move/i).length).toBeGreaterThanOrEqual(1);
    expect(within(panel).getByText(/Reason: Make move/i)).toBeInTheDocument();

    // Second event shows error but no reason
    expect(within(panel).getByText('2025-01-01T00:00:01.000Z')).toBeInTheDocument();
    expect(within(panel).getByText(/^Error: BUSINESS_RULE: Selected square is already occupied\./i)).toBeInTheDocument();
  });
});

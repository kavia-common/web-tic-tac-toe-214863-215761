import React from 'react';
import { render, screen } from '@testing-library/react';
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

    render(<AuditTrailPanel events={events} />);

    // First event shows reason but not error
    expect(screen.getByText(/Audit Trail/i)).toBeInTheDocument();
    expect(screen.getByText('2025-01-01T00:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText(/u1 \(player\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Move/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Reason: Make move/i)).toBeInTheDocument();

    // Second event shows error but no reason
    expect(screen.getByText('2025-01-01T00:00:01.000Z')).toBeInTheDocument();
    expect(screen.getByText(/Error: BUSINESS_RULE: Selected square is already occupied\./i)).toBeInTheDocument();
  });
});

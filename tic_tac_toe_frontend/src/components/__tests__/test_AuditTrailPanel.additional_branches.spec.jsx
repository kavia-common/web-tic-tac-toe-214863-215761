import React from 'react';
import { render, screen } from '@testing-library/react';
import AuditTrailPanel from '../AuditTrailPanel';

describe('AuditTrailPanel - additional branches and classnames', () => {
  test('applies action type class and shows error single-prefixed', () => {
    const events = [
      {
        timestamp: '2025-01-01T00:00:01.000Z',
        userId: 'auditor1',
        userRole: 'auditor',
        actionType: 'ERROR',
        entity: 'Move',
        error: 'VALIDATION_ERROR: Out of range', // should render as-is (already single prefixed)
      },
    ];
    render(<AuditTrailPanel events={events} />);
    const action = screen.getByText('ERROR');
    expect(action).toHaveClass('audit-action', 'audit-error');
    expect(screen.getByText(/Error: VALIDATION_ERROR: Out of range/i)).toBeInTheDocument();
  });
});

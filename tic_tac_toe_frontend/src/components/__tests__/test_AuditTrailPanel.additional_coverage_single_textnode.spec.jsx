import React from 'react';
import { render, within } from '@testing-library/react';
import AuditTrailPanel from '../../components/AuditTrailPanel';

describe('AuditTrailPanel additional coverage for error text node wrapper', () => {
  test('renders audit error string inside a single data-testid node', () => {
    const events = [
      {
        timestamp: '2024-02-02T00:00:00.000Z',
        userId: 'u2',
        userRole: 'player',
        actionType: 'ERROR',
        entity: 'Move',
        reason: 'Make move',
        error: 'BUSINESS_RULE: Selected square is already occupied.',
      },
    ];
    const { container } = render(<AuditTrailPanel events={events} />);
    const scope = within(container);
    const errNode = scope.getByTestId('audit-error-text');
    expect(errNode).toBeInTheDocument();
    expect(errNode).toHaveTextContent(/^Error:\sBUSINESS_RULE:\sSelected square is already occupied\./);
  });
});

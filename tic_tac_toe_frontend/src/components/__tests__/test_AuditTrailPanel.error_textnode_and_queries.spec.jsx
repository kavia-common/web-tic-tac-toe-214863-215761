import { render, screen, within } from '@testing-library/react';
import AuditTrailPanel from '../../components/AuditTrailPanel';

const sample = [{
  timestamp: '2024-01-01T00:00:00.000Z',
  userId: 'u1',
  userRole: 'player',
  actionType: 'ERROR',
  entity: 'Move',
  reason: 'Make move',
  error: 'BUSINESS_RULE: Game already ended.',
  correlationId: 'c1'
}];

test('AuditTrailPanel renders single error text node for assertions', () => {
  const { container } = render(<AuditTrailPanel events={sample} />);
  const scope = within(container);
  const region = scope.getByRole('region', { name: /audit trail/i });
  expect(region).toBeInTheDocument();

  const errNode = scope.getByTestId('audit-error-text');
  expect(errNode).toBeInTheDocument();
  // use toHaveTextContent so it works even if split by spans in future changes
  expect(errNode).toHaveTextContent('Error: BUSINESS_RULE: Game already ended.');
});

/**
 * Ensure AuditTrailPanel renders the full error string in a single text node wrapper
 * so queries using toHaveTextContent are stable.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import AuditTrailPanel from '../../components/AuditTrailPanel';

test('renders error fulltext in single node for toHaveTextContent', () => {
  const events = [{
    timestamp: '2024-01-01T00:00:00Z',
    userId: 'u1',
    userRole: 'player',
    actionType: 'ERROR',
    entity: 'Move',
    reason: 'Make move',
    error: 'Business Rule: Game already ended.'
  }];

  const { container } = render(<AuditTrailPanel events={events} />);
  const panel = screen.getByTestId('audit-panel');
  const errorDiv = within(panel).getByTestId('audit-error-text');
  const fullText = within(errorDiv).getByTestId('audit-error-fulltext');
  expect(fullText).toHaveTextContent('Business Rule: Game already ended.');
  // Also ensure container content includes the full text
  expect(container).toHaveTextContent('Business Rule: Game already ended.');
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import AuditTrailPanel from '../AuditTrailPanel.jsx';
import { AuditContext } from '../../state/AuditContext.jsx';

// Tests: ensure error lines are rendered as a single text node or under data-testid,
// with structured payloads {errorCode, errorMessage}, covering lines 32-42.

describe('AuditTrailPanel standardized audit payload and single node rendering', () => {
  test('renders structured BUSINESS_RULE audit error with single text node or testid', () => {
    const mockAudit = [
      {
        id: '1',
        type: 'ERROR',
        error: { errorCode: 'BUSINESS_RULE', errorMessage: 'Selected square is already occupied.' },
        message: 'Business Rule: Selected square is already occupied.',
        timestamp: new Date().toISOString(),
      },
    ];
    render(
      <AuditContext.Provider value={{ auditTrail: mockAudit }}>
        <AuditTrailPanel />
      </AuditContext.Provider>
    );

    const node = screen.getByTestId('audit-error-line');
    expect(node).toBeInTheDocument();
    const text = node.textContent || '';
    // single prefix
    expect(text).toMatch(/^Business Rule: /);
    expect(text).toContain('Selected square is already occupied.');
    expect(text.match(/: /g)?.length).toBe(1);
  });

  test('renders VALIDATION_ERROR audit line properly with single text node', () => {
    const mockAudit = [
      {
        id: '2',
        type: 'ERROR',
        error: { errorCode: 'VALIDATION_ERROR', errorMessage: 'Index must be between 0 and 8.' },
        message: 'Validation Error: Index must be between 0 and 8.',
        timestamp: new Date().toISOString(),
      },
    ];
    render(
      <AuditContext.Provider value={{ auditTrail: mockAudit }}>
        <AuditTrailPanel />
      </AuditContext.Provider>
    );
    const node = screen.getByTestId('audit-error-line');
    expect(node).toBeInTheDocument();
    const text = node.textContent || '';
    expect(text).toMatch(/^Validation Error: /);
    expect(text).toContain('Index must be between 0 and 8.');
    expect(text.match(/: /g)?.length).toBe(1);
  });
});

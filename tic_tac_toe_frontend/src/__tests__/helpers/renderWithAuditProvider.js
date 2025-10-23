import React from 'react';
import { render } from '@testing-library/react';
import { AuditTrailProvider } from '../../state/AuditContext';

/**
 * PUBLIC_INTERFACE
 * renderWithAuditProvider
 * This is a public test helper.
 * Renders a given React element within the AuditTrailProvider to satisfy context dependencies.
 * @param {React.ReactElement} ui
 * @param {object} [options]
 * @returns {ReturnType<typeof render>}
 */
export function renderWithAuditProvider(ui, options) {
  return render(<AuditTrailProvider>{ui}</AuditTrailProvider>, options);
}

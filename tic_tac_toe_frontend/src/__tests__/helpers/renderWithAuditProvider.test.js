import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithAuditProvider } from './renderWithAuditProvider';

// PUBLIC_INTERFACE
describe('renderWithAuditProvider smoke', () => {
  /** Ensures the helper renders without crashing and context is provided. */
  test('renders child content within provider', () => {
    renderWithAuditProvider(<div data-testid="smoke-child">ok</div>);
    const el = screen.getByTestId('smoke-child');
    expect(el).toHaveTextContent('ok');
  });
});

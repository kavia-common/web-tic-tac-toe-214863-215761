import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

// These tests aim to cover App.js branches by exercising error formatting
// and ensuring the UI renders a single-prefixed string and uses robust selectors.

describe('App standardized error model and specific lines coverage', () => {
  test('renders formatted single-prefixed error string and exposes robust selectors', () => {
    render(<App />);

    // App container exists
    const appRoot = screen.getByTestId('app-root');
    expect(appRoot).toBeInTheDocument();

    // Squares should be present
    const squares = screen.getAllByTestId(/square-\d+/i);
    expect(squares.length).toBe(9);

    // Access audit panel before errors
    const auditPanel = screen.getByTestId('audit-panel');
    expect(auditPanel).toBeInTheDocument();

    // Create an error: click a square twice -> occupied square error
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[0]); // occupied -> BUSINESS_RULE

    // Validate that AuditTrailPanel renders full error text in a single node via provided test id
    const errorNode = within(auditPanel).getAllByTestId('audit-error-fulltext').pop();
    expect(errorNode).toBeInTheDocument();
    const text = errorNode.textContent || '';

    // Expect standardized single prefix with code and message
    expect(text).toMatch(/^[A-Z_]+: /);
    expect(text).toContain('Selected square is already occupied.');
    // single prefix only
    expect((text.match(/: /g) || []).length).toBe(1);
  });

  test('post-game action triggers BUSINESS_RULE "Game already ended." and renders audit line as single node', () => {
    render(<App />);
    const squares = screen.getAllByTestId(/square-\d+/i);

    // Force a game end (X wins using 0,4,8 diagonal)
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[1]); // O
    fireEvent.click(squares[4]); // X
    fireEvent.click(squares[2]); // O
    fireEvent.click(squares[8]); // X wins

    // Now attempt another move; should trigger game-ended BUSINESS_RULE
    fireEvent.click(squares[3]);

    const auditPanel = screen.getByTestId('audit-panel');
    const errorNode = within(auditPanel).getAllByTestId('audit-error-fulltext').pop();
    const text = errorNode?.textContent || '';
    expect(text).toMatch(/^[A-Z_]+: Game already ended\./);
  });

  test('covers App conditional modal visibility path by opening reset modal then cancel', () => {
    render(<App />);
    // Open signature modal through reset flow if allowed; find Reset button in controls
    // Controls component typically renders Reset; use role + name robust query
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // App should render modal subtree
    const modal = screen.getByTestId('signature-modal');
    expect(modal).toBeInTheDocument();

    // Close modal via cancel to exercise conditional rendering path
    const cancelBtn = within(modal).getByTestId('cancel-signature');
    fireEvent.click(cancelBtn);

    // Modal should no longer be in the document
    expect(screen.queryByTestId('signature-modal')).not.toBeInTheDocument();
  });
});

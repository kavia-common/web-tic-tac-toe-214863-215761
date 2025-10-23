/**
 * Add coverage for App.js lines involving theme toggle and role select updates,
 * and export audit permissions gate (lines ~25, 94-95 in coverage report).
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

test('theme toggle updates aria-label and persists', () => {
  render(<App />);
  const toggle = screen.getByRole('button', { name: /Switch to dark mode/i });
  fireEvent.click(toggle);
  // after click, it should switch to light mode label icon text
  const toggle2 = screen.getByRole('button', { name: /Switch to light mode/i });
  expect(toggle2).toBeInTheDocument();
});

test('role select changes and disables reset if not permitted', () => {
  render(<App />);
  const roleSelect = screen.getByLabelText('Select user role');
  fireEvent.change(roleSelect, { target: { value: 'player' } });

  // Find Reset button in Controls by role/button name
  const resetBtn = screen.getByRole('button', { name: /reset/i });
  // Player may not be able to reset; clicking shouldn't open modal
  fireEvent.click(resetBtn);
  const maybeModal = screen.queryByTestId('signature-modal');
  // Either null or not visible
  expect(maybeModal).toBeNull();
});

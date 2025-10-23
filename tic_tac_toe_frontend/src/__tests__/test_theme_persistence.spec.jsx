import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../App';

describe('Theme persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  test('persists the selected theme and restores on rerender', () => {
    const { unmount } = render(<App />);
    const html = document.documentElement;
    expect(html.getAttribute('data-theme')).toBe('light');

    const toggleBtn = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(toggleBtn);
    expect(html.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('ttt_theme_v1')).toBe('dark');

    unmount();
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

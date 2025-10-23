import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Controls from '../Controls';

describe('Controls component', () => {
  const historyLabels = ['Go to start', 'Go to move #1', 'Go to move #2'];

  test('buttons are disabled/enabled based on permissions', () => {
    const onReset = jest.fn();
    const onJump = jest.fn();
    const onExportAudit = jest.fn();

    render(<Controls
      onReset={onReset}
      onJump={onJump}
      historyLabels={historyLabels}
      onExportAudit={onExportAudit}
      permissions={{ canReset: false, canJump: false, canExport: true }}
    />);

    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    const exportBtn = screen.getByRole('button', { name: /Export audit trail/i });
    const jumpBtns = screen.getAllByRole('button', { name: /Jump to move/i });

    expect(resetBtn).toBeDisabled();
    expect(exportBtn).not.toBeDisabled();
    jumpBtns.forEach(b => expect(b).toBeDisabled());

    fireEvent.click(exportBtn);
    expect(onExportAudit).toHaveBeenCalledTimes(1);
  });

  test('invokes onReset and onJump when enabled', () => {
    const onReset = jest.fn();
    const onJump = jest.fn();
    const onExportAudit = jest.fn();

    render(<Controls
      onReset={onReset}
      onJump={onJump}
      historyLabels={historyLabels}
      onExportAudit={onExportAudit}
      permissions={{ canReset: true, canJump: true, canExport: false }}
    />);

    const resetBtn = screen.getByRole('button', { name: /Reset game/i });
    expect(resetBtn).not.toBeDisabled();
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);

    const jumpBtns = screen.getAllByRole('button', { name: /Jump to move/i });
    fireEvent.click(jumpBtns[2]);
    expect(onJump).toHaveBeenCalledWith(2);
  });
});

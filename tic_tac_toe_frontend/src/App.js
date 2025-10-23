import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Board from './components/Board';
import StatusBar from './components/StatusBar';
import Controls from './components/Controls';
import AuditTrailPanel from './components/AuditTrailPanel';
import ModalSignature from './components/ModalSignature';
import { useTicTacToe } from './hooks/useTicTacToe';
import { AuditTrailProvider, useAudit } from './state/AuditContext';
import { permissionsForRole, hasPermission } from './utils/accessControl';
import { buildAuditRecord } from './utils/audit';

// Theme storage key for persistence
const THEME_KEY = 'ttt_theme_v1';

/**
 * RootAppComposition composes providers and the game app.
 * Separate component so hooks can consume context values cleanly.
 */
function RootAppComposition() {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const { currentUser, appendAuditEvent, events, exportEvents, setCurrentUser } = useAudit();
  const { history, current, winner, isDraw, makeMove, resetGame, jumpTo } = useTicTacToe();
  const permissions = useMemo(() => permissionsForRole(currentUser?.role), [currentUser]);

  // Status text
  const statusText = winner
    ? `Winner: ${winner}`
    : isDraw
      ? 'Draw!'
      : `Next player: ${current.nextPlayer}`;

  const handleSquareClick = (idx) => {
    if (!permissions.canMove) return;
    makeMove(idx);
  };

  const historyLabels = history.map((h, idx) =>
    idx === 0 ? 'Go to start' : `Go to move #${idx}`
  );

  const onResetClick = () => {
    if (!hasPermission(currentUser?.role, 'reset')) return;
    setPendingReset(true);
    setSignatureOpen(true);
  };

  const onExportAudit = () => {
    if (!hasPermission(currentUser?.role, 'export')) return;
    const payload = exportEvents();
    // In lieu of download, log and audit the export action
    // eslint-disable-next-line no-console
    console.log('AUDIT EXPORT\n', payload);
    appendAuditEvent(buildAuditRecord({
      userId: currentUser?.id || 'anonymous',
      userRole: currentUser?.role || 'player',
      actionType: 'READ',
      entity: 'AuditTrail',
      beforeState: null,
      afterState: { count: events.length },
      reason: 'Export audit trail'
    }));
  };

  const onConfirmSignature = ({ signature, reason }) => {
    setSignatureOpen(false);
    if (pendingReset) {
      resetGame(reason, { signature, reason });
      setPendingReset(false);
    }
  };

  const onCancelSignature = () => {
    setSignatureOpen(false);
    setPendingReset(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="ttt-container">
          <div className="toolbar">
            <div className="user-role">
              <label htmlFor="role-select">Role:</label>
              <select
                id="role-select"
                value={currentUser?.role || 'player'}
                onChange={(e) => setCurrentUser({ ...(currentUser || { id: 'user1' }), role: e.target.value })}
                aria-label="Select user role"
              >
                <option value="player">Player</option>
                <option value="auditor">Auditor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <StatusBar statusText={statusText} />
          <Board squares={current.squares} onSquareClick={handleSquareClick} disabled={Boolean(winner || isDraw)} />
          <Controls
            onReset={onResetClick}
            onJump={jumpTo}
            historyLabels={historyLabels}
            onExportAudit={onExportAudit}
            permissions={{
              canReset: permissions.canReset,
              canJump: permissions.canJump,
              canExport: permissions.canExport
            }}
          />
          <AuditTrailPanel events={events} />
        </div>
      </header>

      <ModalSignature
        open={signatureOpen}
        onConfirm={onConfirmSignature}
        onCancel={onCancelSignature}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <AuditTrailProvider>
      <RootAppComposition />
    </AuditTrailProvider>
  );
}

export default App;

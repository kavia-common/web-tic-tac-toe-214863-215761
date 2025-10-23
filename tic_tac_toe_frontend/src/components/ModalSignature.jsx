/*
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-ESIG-001
// User Story: As a user, I must provide an electronic signature and reason for critical actions.
// Acceptance Criteria: Modal captures signature and reason; validates non-empty.
// GxP Impact: YES - electronic signature.
// Risk Level: HIGH
// Validation Protocol: VP-ESIG-001
// ============================================================================
*/

import React, { useEffect, useRef, useState } from 'react';
import { validateSignature } from '../utils/validation';

/**
 * PUBLIC_INTERFACE
 * ModalSignature
 * This is a public component.
 * Simple modal to capture signature and reason.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {function({signature:string, reason:string}):void} props.onConfirm - Confirm handler
 * @param {function():void} props.onCancel - Cancel handler
 * @returns {JSX.Element|null}
 */
function ModalSignature({ open, onConfirm, onCancel }) {
  const [signature, setSignature] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const sigRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSignature('');
      setReason('');
      setError('');
      setTimeout(() => {
        if (sigRef.current) sigRef.current.focus();
      }, 0);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    const { valid, message } = validateSignature(signature, reason);
    if (!valid) {
      // Standardize explicit validation messages so tests can assert reliably
      // Prefer specific messages when provided by validator.
      const msg = message || (signature ? 'Reason required' : 'Signature required');
      setError(msg);
      return;
    }
    onConfirm({ signature, reason });
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-title"
      aria-describedby="signature-desc"
      aria-label="Electronic Signature Required"
      ref={dialogRef}
      data-testid="signature-modal"
    >
      {/* Testing guidance: queries should use within(dialog) using this container */}
      <div className="modal" data-testid="signature-modal-container" data-modal-testid="modal-signature" data-testid-compat="modal-signature">
        <h3 id="signature-title">Electronic Signature Required</h3>
        <p id="signature-desc" className="sr-only">
          Provide your electronic signature and a reason for the action, then press Confirm Signature to proceed or Cancel Signature to abort.
        </p>
        <div className="form-group">
          <label htmlFor="signature-input">Signature (type your password)</label>
          <input
            id="signature-input"
            ref={sigRef}
            type="password"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            aria-required="true"
            aria-label="Signature input"
            placeholder="Enter your signature"
            name="signature"
            autoComplete="current-password"
            data-testid="signature-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reason-input">Reason for change</label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-required="true"
            aria-label="Reason input"
            placeholder="Describe why this change is necessary"
            name="reason"
            autoComplete="off"
            data-testid="reason-input"
          />
        </div>
        {error ? (
          <div className="error-text" role="alert" aria-live="assertive" data-testid="signature-error">
            {error}
          </div>
        ) : null}
        <div className="modal-actions">
          <button
            className="btn"
            onClick={handleConfirm}
            aria-label="Confirm Signature"
            name="confirm-signature"
            data-testid="confirm-signature"
          >
            Confirm Signature
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            aria-label="Cancel Signature"
            name="cancel-signature"
            data-testid="cancel-signature"
          >
            Cancel Signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalSignature;

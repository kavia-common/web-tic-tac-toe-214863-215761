import { makeError, formatError, normalizeErrorCode } from '../error';

describe('error utils', () => {
  test('makeError sets code and message (normalized)', () => {
    const err = makeError('validation', 'bar');
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('bar');
  });

  test('normalizeErrorCode maps variants to standardized categories', () => {
    expect(normalizeErrorCode('validation')).toBe('VALIDATION_ERROR');
    expect(normalizeErrorCode('BUSINESS_RULE_VIOLATION')).toBe('BUSINESS_RULE');
    expect(normalizeErrorCode('unauthorized')).toBe('AUTHZ_ERROR');
    expect(normalizeErrorCode('forbidden')).toBe('AUTHZ_ERROR');
    expect(normalizeErrorCode('authz_error')).toBe('AUTHZ_ERROR');
  });

  test('formatError handles null/undefined', () => {
    expect(formatError(null)).toMatch(/^UNKNOWN:/);
    expect(formatError(undefined)).toMatch(/^UNKNOWN:/);
  });

  test('formatError returns CODE: message when code present', () => {
    const err = makeError('VALIDATION_ERROR', 'Oops');
    const msg = formatError(err);
    expect(msg).toBe('VALIDATION_ERROR: Oops');
  });

  test('formatError falls back to ERROR code when missing', () => {
    const e = new Error('plain');
    const msg = formatError(e);
    expect(msg).toBe('ERROR: plain');
  });

  test('formatError prefixes only once even if message already contains code', () => {
    const e = makeError('BUSINESS_RULE', 'BUSINESS_RULE: Selected square is already occupied.');
    const msg = formatError(e);
    // message should be single-prefixed, not BUSINESS_RULE: BUSINESS_RULE: ...
    expect(msg).toBe('BUSINESS_RULE: Selected square is already occupied.');
  });

  test('formatError preserves plain message while normalizing code', () => {
    const e = makeError('validation_error', 'VALIDATION_ERROR: Move index must be an integer between 0 and 8.');
    // Should keep only one prefix and keep the plain message after stripping the duplicate
    expect(formatError(e)).toBe('VALIDATION_ERROR: Move index must be an integer between 0 and 8.');
  });

  test('formatError strips any duplicate prefixes regardless of differing codes', () => {
    const e = makeError('VALIDATION_ERROR', 'BUSINESS_RULE: Some failure');
    // Final prefix should use the error.code (VALIDATION_ERROR), but only once
    expect(formatError(e)).toBe('VALIDATION_ERROR: Some failure');
  });
});

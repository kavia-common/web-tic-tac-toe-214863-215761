import { formatError, makeError } from '../../utils/error';

describe('formatError additional coverage for null/undefined and prefix stripping', () => {
  test('null/undefined return UNKNOWN: Unknown error', () => {
    expect(formatError(null)).toBe('UNKNOWN: Unknown error');
    expect(formatError(undefined)).toBe('UNKNOWN: Unknown error');
  });

  test('string with prefixed code is stripped and normalized to UNKNOWN', () => {
    expect(formatError('BUSINESS_RULE: Something happened')).toBe('UNKNOWN: Something happened');
    expect(formatError('AUTHZ_ERROR: Forbidden')).toBe('UNKNOWN: Forbidden');
  });

  test('makeError created errors retain message without code in message', () => {
    const e = makeError('VALIDATION_ERROR', 'Invalid move index for jump.');
    expect(e.message).toBe('Invalid move index for jump.');
    expect(e.code).toBe('VALIDATION_ERROR');
  });
});

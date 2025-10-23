import { makeError, formatError } from '../error';

describe('error utils', () => {
  test('makeError sets code and message', () => {
    const err = makeError('FOO', 'bar');
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('FOO');
    expect(err.message).toBe('bar');
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
});

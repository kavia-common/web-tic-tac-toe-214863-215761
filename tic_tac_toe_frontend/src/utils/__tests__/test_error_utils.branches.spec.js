import { makeError, formatError, normalizeErrorCode } from '../error';

describe('error utils - branch coverage', () => {
  test('normalizeErrorCode returns ERROR when raw is empty/unknown', () => {
    expect(normalizeErrorCode('')).toBe('ERROR');
    expect(normalizeErrorCode(null)).toBe('ERROR');
    expect(normalizeErrorCode(undefined)).toBe('ERROR');
    expect(normalizeErrorCode('some_weird_code')).toBe('SOME_WEIRD_CODE'.toUpperCase());
  });

  test('formatError handles primitive string and non-serializable object', () => {
    expect(formatError('plain string')).toBe('ERROR: plain string');

    const circular = {};
    // @ts-ignore
    circular.self = circular;
    const result = formatError(circular);
    // it should not throw and should return a string starting with ERROR:
    expect(typeof result).toBe('string');
    expect(result.startsWith('ERROR:')).toBe(true);
  });

  test('formatError strips pre-existing prefixes and uses normalized code', () => {
    // Incoming error without code but with prefixed message should fallback to ERROR code and strip internal prefix
    const e = new Error('BUSINESS_RULE: Something bad');
    const msg = formatError(e);
    expect(msg).toBe('ERROR: Something bad');

    // With mismatched code and message prefix: prefer code and strip internal message prefix
    const err = makeError('AUTHZ', 'VALIDATION_ERROR: Nope');
    expect(formatError(err)).toBe('AUTHZ_ERROR: Nope');
  });

  test('makeError with unknown code still carries message and normalized code', () => {
    const e = makeError('unknown_code', 'oops');
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('oops');
    // normalizeErrorCode will uppercase unknown value; function uses normalizeErrorCode
    expect(e.code).toBe('UNKNOWN_CODE');
  });
});

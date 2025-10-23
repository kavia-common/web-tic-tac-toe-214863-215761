import { makeError, formatError, normalizeErrorCode, normalizeError } from '../error';

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

  test('normalizeError returns structured UNKNOWN for null/undefined and strips prefixes', () => {
    expect(normalizeError(null)).toEqual({ errorCode: 'UNKNOWN', errorMessage: 'Unknown error' });
    expect(normalizeError('VALIDATION_ERROR: Bad input')).toEqual({ errorCode: 'UNKNOWN', errorMessage: 'Bad input' });
  });

  test('formatError handles null/undefined with human phrasing', () => {
    expect(formatError(null)).toBe('Unknown Error: Unknown error');
    expect(formatError(undefined)).toBe('Unknown Error: Unknown error');
  });

  test('formatError returns human-friendly category strings', () => {
    const err = makeError('VALIDATION_ERROR', 'Oops');
    const msg = formatError(err);
    expect(msg).toBe('Validation Error: Oops');
  });

  test('formatError treats unknown code as Unknown Error', () => {
    const e = new Error('plain');
    const msg = formatError(e);
    expect(msg).toBe('Unknown Error: plain');
  });

  test('formatError prefixes only once even if message already contains a technical prefix', () => {
    const e = makeError('BUSINESS_RULE', 'BUSINESS_RULE: Selected square is already occupied.');
    const msg = formatError(e);
    expect(msg).toBe('Business Rule: Selected square is already occupied.');
  });

  test('formatError preserves plain message while mapping to human category', () => {
    const e = makeError('validation_error', 'VALIDATION_ERROR: Move index must be an integer between 0 and 8.');
    expect(formatError(e)).toBe('Validation Error: Move index must be an integer between 0 and 8.');
  });

  test('formatError strips any duplicate prefixes regardless of differing codes', () => {
    const e = makeError('VALIDATION_ERROR', 'BUSINESS_RULE: Some failure');
    expect(formatError(e)).toBe('Validation Error: Some failure');
  });
});

import { formatError, makeError } from '../../utils/error';

describe('formatError null/undefined/string handling', () => {
  test('null returns UNKNOWN: Unknown error', () => {
    expect(formatError(null)).toBe('UNKNOWN: Unknown error');
  });
  test('undefined returns UNKNOWN: Unknown error', () => {
    expect(formatError(undefined)).toBe('UNKNOWN: Unknown error');
  });
  test('plain string is treated as UNKNOWN with stripped prefix if any', () => {
    expect(formatError('Some message')).toBe('UNKNOWN: Some message');
    expect(formatError('VALIDATION_ERROR: Bad index')).toBe('UNKNOWN: Bad index');
  });
  test('makeError carries code and message, formatError prints CODE: message', () => {
    const e = makeError('BUSINESS_RULE', 'Game already ended.');
    expect(e.code).toBe('BUSINESS_RULE');
    expect(e.message).toBe('Game already ended.');
    expect(formatError(e)).toBe('BUSINESS_RULE: Game already ended.');
  });
});

/**
 * formatError null/undefined handling and string inputs
 */
import { formatError, makeError } from '../../utils/error';

describe('formatError null/undefined and strings', () => {
  test('null returns UNKNOWN: Unknown error', () => {
    expect(formatError(null)).toBe('UNKNOWN: Unknown error');
  });
  test('undefined returns UNKNOWN: Unknown error', () => {
    expect(formatError(undefined)).toBe('UNKNOWN: Unknown error');
  });
  test('string strips prefix and uses UNKNOWN', () => {
    expect(formatError('VALIDATION_ERROR: Bad input')).toBe('UNKNOWN: Bad input');
    expect(formatError('just a message')).toBe('UNKNOWN: just a message');
  });
  test('makeError and formatError single prefix', () => {
    const e = makeError('BUSINESS_RULE', 'Game already ended.');
    expect(formatError(e)).toBe('BUSINESS_RULE: Game already ended.');
  });
});

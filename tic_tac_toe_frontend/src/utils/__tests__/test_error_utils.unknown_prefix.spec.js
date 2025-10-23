import { formatError, makeError } from '../error';

describe('error utils - unknown/null handling and single prefix', () => {
  test('formatError(null/undefined) returns UNKNOWN: Unknown error', () => {
    expect(formatError(null)).toBe('UNKNOWN: Unknown error');
    expect(formatError(undefined)).toBe('UNKNOWN: Unknown error');
  });

  test('formatError does not double-prefix when message itself contains CODE:', () => {
    const e = makeError('BUSINESS_RULE', 'VALIDATION_ERROR: Nope');
    // Should prefer BUSINESS_RULE code and strip validation prefix from message
    expect(formatError(e)).toBe('BUSINESS_RULE: Nope');
  });
});

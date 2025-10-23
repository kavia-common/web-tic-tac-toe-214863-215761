import { formatError, normalizeError, makeError } from '../../utils/error';

describe('error utils standardized prefixes and codes', () => {
  test('formatError returns exact title-cased strings and strips existing prefixes', () => {
    expect(formatError({ errorCode: 'BUSINESS_RULE', errorMessage: 'Game already ended.' }))
      .toBe('Business Rule: Game already ended.');
    expect(formatError({ errorCode: 'VALIDATION_ERROR', errorMessage: 'Move index must be an integer between 0 and 8.' }))
      .toBe('Validation Error: Move index must be an integer between 0 and 8.');
    expect(formatError({ errorCode: 'AUTHZ_ERROR', errorMessage: 'User lacks permission to move.' }))
      .toBe('Authorization Error: User lacks permission to move.');
    // Unknown maps to Unknown Error
    expect(formatError({ errorCode: 'UNKNOWN', errorMessage: 'Something odd' }))
      .toBe('Unknown Error: Something odd');
    // Existing prefix should be stripped to avoid double prefix
    expect(formatError({ errorCode: 'VALIDATION_ERROR', errorMessage: 'Validation Error: Already prefixed' }))
      .toBe('Validation Error: Already prefixed');
  });

  test('normalizeError returns structured codes with uppercase categories', () => {
    const e = makeError('validation_error', 'bad index');
    const n = normalizeError(e);
    expect(n.errorCode).toBe('VALIDATION_ERROR');
    expect(n.errorMessage).toBe('bad index');

    const fromString = normalizeError('Business Rule: Oops');
    expect(fromString.errorCode).toBe('UNKNOWN');
    expect(fromString.errorMessage).toBe('Oops');
  });
});

import { validateSignature } from '../validation';

describe('validateSignature', () => {
  test('rejects short signature', () => {
    expect(validateSignature('', 'valid reason').valid).toBe(false);
    expect(validateSignature('a', 'valid reason').valid).toBe(false);
  });
  test('rejects short reason', () => {
    expect(validateSignature('ok', 'no').valid).toBe(false);
  });
  test('accepts valid inputs', () => {
    expect(validateSignature('sig', 'because this is necessary').valid).toBe(true);
  });
});

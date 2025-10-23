import {
  validateSignature,
  validateMoveIndex,
  validateSquareAvailable,
  validateAlternation,
  validateGameNotEnded
} from '../validation';

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

describe('move validations', () => {
  // VALIDATION_ERROR expectation
  test('validateMoveIndex throws on non-integer or out-of-range', () => {
    expect.assertions(8);
    try { validateMoveIndex(-1); } catch (e) { expect(e.code).toBe('VALIDATION_ERROR'); expect(e.message).toMatch(/integer between 0 and 8/); }
    try { validateMoveIndex(9); } catch (e) { expect(e.code).toBe('VALIDATION_ERROR'); expect(e.message).toMatch(/integer between 0 and 8/); }
    try { validateMoveIndex(1.5); } catch (e) { expect(e.code).toBe('VALIDATION_ERROR'); expect(e.message).toMatch(/integer between 0 and 8/); }
    try { /* @ts-ignore */ validateMoveIndex('2'); } catch (e) { expect(e.code).toBe('VALIDATION_ERROR'); expect(e.message).toMatch(/integer between 0 and 8/); }
  });

  // BUSINESS_RULE expectations
  test('validateSquareAvailable throws when occupied', () => {
    const squares = Array(9).fill(null);
    squares[0] = 'X';
    try {
      validateSquareAvailable(squares, 0);
    } catch (e) {
      // assert on code and plain message
      expect(e.code).toBe('BUSINESS_RULE');
      expect(e.message).toMatch(/already occupied/);
    }
  });

  test('validateAlternation throws when rule violated', () => {
    const current = { squares: ['X', null, null, null, null, null, null, null, null] }; // X count 1, O 0 -> expected O
    try {
      validateAlternation('X', current, 1);
    } catch (e) {
      expect(e.code).toBe('BUSINESS_RULE');
      expect(e.message).toMatch(/alternation/i);
    }
  });

  test('validateGameNotEnded throws when winner or draw present', () => {
    try { validateGameNotEnded('X', false); } catch (e) { expect(e.code).toBe('BUSINESS_RULE'); expect(e.message).toMatch(/already ended/i); }
    try { validateGameNotEnded(null, true); } catch (e) { expect(e.code).toBe('BUSINESS_RULE'); expect(e.message).toMatch(/already ended/i); }
  });
});

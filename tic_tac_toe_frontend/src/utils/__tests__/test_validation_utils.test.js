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
  test('validateMoveIndex throws on non-integer or out-of-range', () => {
    expect(() => validateMoveIndex(-1)).toThrow(/VALIDATION_ERROR/);
    expect(() => validateMoveIndex(9)).toThrow(/VALIDATION_ERROR/);
    expect(() => validateMoveIndex(1.5)).toThrow(/VALIDATION_ERROR/);
    expect(() => validateMoveIndex('2')).toThrow(); // type error
  });

  test('validateSquareAvailable throws when occupied', () => {
    const squares = Array(9).fill(null);
    squares[0] = 'X';
    expect(() => validateSquareAvailable(squares, 0)).toThrow(/BUSINESS_RULE/);
  });

  test('validateAlternation throws when rule violated', () => {
    const current = { squares: ['X', null, null, null, null, null, null, null, null] }; // X count 1, O 0 -> expected O
    expect(() => validateAlternation('X', current, 1)).toThrow(/BUSINESS_RULE/);
  });

  test('validateGameNotEnded throws when winner or draw present', () => {
    expect(() => validateGameNotEnded('X', false)).toThrow(/BUSINESS_RULE/);
    expect(() => validateGameNotEnded(null, true)).toThrow(/BUSINESS_RULE/);
  });
});

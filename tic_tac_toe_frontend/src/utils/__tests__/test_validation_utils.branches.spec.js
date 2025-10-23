import {
  validateSignature,
  validateMoveIndex,
  validateSquareAvailable,
  validateAlternation,
  validateGameNotEnded
} from '../validation';

describe('validation utils - additional branches', () => {
  test('validateSignature trims and enforces min lengths', () => {
    expect(validateSignature('  ', 'valid reason').valid).toBe(false);
    expect(validateSignature('ok', '  a ').valid).toBe(false);
    expect(validateSignature('  ok  ', '  good reason  ').valid).toBe(true);
  });

  test('validateSquareAvailable allows empty square', () => {
    const squares = Array(9).fill(null);
    expect(() => validateSquareAvailable(squares, 4)).not.toThrow();
  });

  test('validateAlternation happy path for both starting and subsequent turns', () => {
    const start = { squares: Array(9).fill(null) };
    expect(() => validateAlternation('X', start, 0)).not.toThrow();
    const afterX = { squares: ['X', null, null, null, null, null, null, null, null] };
    expect(() => validateAlternation('O', afterX, 1)).not.toThrow();
  });

  test('validateGameNotEnded does nothing when ongoing', () => {
    expect(() => validateGameNotEnded(null, false)).not.toThrow();
  });

  test('validateMoveIndex accepts edge bounds 0 and 8 as valid', () => {
    expect(() => validateMoveIndex(0)).not.toThrow();
    expect(() => validateMoveIndex(8)).not.toThrow();
  });
});

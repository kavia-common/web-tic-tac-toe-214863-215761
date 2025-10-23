import { formatError } from '../error';

describe('formatError single-prefix alignment', () => {
  test('BUSINESS_RULE produces "Business Rule: <message>" with single prefix', () => {
    const ui = formatError({ errorCode: 'BUSINESS_RULE', errorMessage: 'Selected square is already occupied.' });
    expect(ui).toBe('Business Rule: Selected square is already occupied.');
    expect(ui.match(/: /g)?.length).toBe(1);
  });

  test('VALIDATION_ERROR produces "Validation Error: <message>" with single prefix', () => {
    const ui = formatError({ errorCode: 'VALIDATION_ERROR', errorMessage: 'Index must be between 0 and 8.' });
    expect(ui).toBe('Validation Error: Index must be between 0 and 8.');
    expect(ui.match(/: /g)?.length).toBe(1);
  });
});

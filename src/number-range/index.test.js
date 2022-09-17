const { NumberRange } = require('.');

describe('NumberRange', () => {
  it('should have a min and a max', () => {
    const min = 10;
    const max = 20;

    const range = new NumberRange(min, max);

    expect(range.min).toEqual(min);
    expect(range.max).toEqual(max);
  });
});

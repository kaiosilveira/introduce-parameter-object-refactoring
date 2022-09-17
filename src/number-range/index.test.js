const { NumberRange } = require('.');

describe('NumberRange', () => {
  const min = 10;
  const max = 20;

  it('should have a min and a max', () => {
    const range = new NumberRange(min, max);

    expect(range.min).toEqual(min);
    expect(range.max).toEqual(max);
  });

  describe('contains', () => {
    it('should return true if a number falls inside of the specified range', () => {
      const range = new NumberRange(min, max);
      expect(range.contains(15)).toEqual(true);
    });

    it('should return false if a number falls outside of the specified range', () => {
      const range = new NumberRange(min, max);
      expect(range.contains(9)).toEqual(false);
      expect(range.contains(21)).toEqual(false);
    });

    it('should contain the lower end of the range', () => {
      const range = new NumberRange(min, max);
      expect(range.contains(min)).toEqual(true);
    });

    it('should contain the upper end of the range', () => {
      const range = new NumberRange(min, max);
      expect(range.contains(max)).toEqual(true);
    });
  });
});

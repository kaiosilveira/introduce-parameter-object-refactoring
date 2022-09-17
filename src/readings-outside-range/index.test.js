const readingsOutsideRange = require('.');
const { NumberRange } = require('../number-range');

describe('readingsOutsideRange', () => {
  it('should return all readings that fall outside of the specified range', () => {
    const min = 10;
    const max = 30;
    const range = new NumberRange(min, max);
    const station = {
      name: 'ZB1',
      readings: [
        { temp: 9, time: '2016-11-10 09:10' },
        { temp: 20, time: '2016-11-10 09:10' },
        { temp: 31, time: '2016-11-10 09:50' },
      ],
    };

    const results = readingsOutsideRange(station, min, max, range);

    expect(results).toHaveLength(2);
    expect(results.some(r => r.temp === 9)).toBeTruthy();
    expect(results.some(r => r.temp === 31)).toBeTruthy();
  });
});

function readingsOutsideRange(station, min, range) {
  return station.readings.filter(r => r.temp < min || r.temp > range.max);
}

module.exports = readingsOutsideRange;

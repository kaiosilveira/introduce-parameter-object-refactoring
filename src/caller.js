const station = require('./data');
const readingsOutsideRange = require('./readings-outside-range');

const operatingPlan = { temperatureFloor: 50, temperatureCeiling: 55 };

const alerts = readingsOutsideRange(
  station,
  operatingPlan.temperatureFloor,
  operatingPlan.temperatureCeiling
);

console.log(alerts);

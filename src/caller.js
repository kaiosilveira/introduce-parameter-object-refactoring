const station = require('./data');
const { NumberRange } = require('./number-range');
const readingsOutsideRange = require('./readings-outside-range');

const operatingPlan = { temperatureFloor: 50, temperatureCeiling: 55 };
const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling);
const alerts = readingsOutsideRange(
  station,
  operatingPlan.temperatureFloor,
  operatingPlan.temperatureCeiling,
  range
);

console.log(alerts);

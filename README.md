[![Continuous Integration](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my "refactoring" catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Introduce Parameter Object

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
function amountInvoiced(startDate, endDate) {
  /*...*/
}

function amountReceived(startDate, endDate) {
  /*...*/
}

function amountOverdue(startDate, endDate) {
  /*...*/
}
```

</td>

<td>

```javascript
function amountInvoiced(aDateRange) {
  /*...*/
}

function amountReceived(aDateRange) {
  /*...*/
}

function amountOverdue(aDateRange) {
  /*...*/
}
```

</td>
</tr>
</tbody>
</table>

Oftentimes we see a group of parameters being used repeatedly as arguments for multiple functions. These groups are often suggesting a hidden structure inside the project's domain. When this pattern is detected, we can use **Introduce Parameter Object** to create a class based on these parameters and use it instead. This refactoring helps with this process.

## Working example

As our working example for this refactoring, we have the `readingsOutsideRange` function, responsible for finding the readings that fall outside of a specified range. This function has the `max` and `min` parameters, which hide a bigger, `NumberRange` structure that can be created to aid in this comparison. The core initial code for the refactoring is:

```javascript
function readingsOutsideRange(station, min, max) {
  return station.readings.filter(r => r.temp < min || r.temp > max);
}
```

### Test suite

A simple test suite with one test was put in place to make sure the `readingsOutsideRange` function was behaving as expected. Corner cases and validations were left out for simplicity. The test suite looks like this:

```javascript
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

    const results = readingsOutsideRange(station, range);

    expect(results).toHaveLength(2);
    expect(results.some(r => r.temp === 9)).toBeTruthy();
    expect(results.some(r => r.temp === 31)).toBeTruthy();
  });
});
```

### Steps

We start by introducing a `NumberRange` class:

```diff
diff --git a/src/number-range/index.js b/src/number-range/index.js
@@ -0,0 +1,15 @@
+class NumberRange {
+  constructor(min, max) {
+    this._data = { min, max };
+  }
+
+  get min() {
+    return this._data.min;
+  }
+
+  get max() {
+    return this._data.max;
+  }
+}
+
+module.exports = { NumberRange };

diff --git a/src/number-range/index.test.js b/src/number-range/index.test.js
@@ -0,0 +1,13 @@
+const { NumberRange } = require('.');
+
+describe('NumberRange', () => {
+  it('should have a min and a max', () => {
+    const min = 10;
+    const max = 20;
+
+    const range = new NumberRange(min, max);
+
+    expect(range.min).toEqual(min);
+    expect(range.max).toEqual(max);
+  });
+});
```

Then, we add a `range` as a parameter to `readingsOutsideRange`...

```diff
diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,4 +1,4 @@
-function readingsOutsideRange(station, min, max) {
+function readingsOutsideRange(station, min, max, range) {
   return station.readings.filter(r => r.temp < min || r.temp > max);
 }
```

...and update the caller to instantiate a `NumberRange` object and pass it down to `readingsOutsideRange`:

```diff
diff --git a/src/caller.js b/src/caller.js
@@ -1,12 +1,14 @@
 const station = require('./data');
+const { NumberRange } = require('./number-range');
 const readingsOutsideRange = require('./readings-outside-range');

 const operatingPlan = { temperatureFloor: 50, temperatureCeiling: 55 };
-
+const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling);
 const alerts = readingsOutsideRange(
   station,
   operatingPlan.temperatureFloor,
-  operatingPlan.temperatureCeiling
+  operatingPlan.temperatureCeiling,
+  range
 );

 console.log(alerts);
```

Then, we start using the `max` field from the `range` obj at `readingsOutsideRange`:

```diff
diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,5 +1,5 @@
 function readingsOutsideRange(station, min, max, range) {
-  return station.readings.filter(r => r.temp < min || r.temp > max);
+  return station.readings.filter(r => r.temp < min || r.temp > range.max);
 }

 module.exports = readingsOutsideRange;

diff --git a/src/readings-outside-range/index.test.js b/src/readings-outside-range/index.test.js
@@ -1,9 +1,11 @@
 const readingsOutsideRange = require('.');
+const { NumberRange } = require('../number-range');

 describe('readingsOutsideRange', () => {
   it('should return all readings that fall outside of the specified range', () => {
     const min = 10;
     const max = 30;
+    const range = new NumberRange(min, max);
     const station = {
       name: 'ZB1',
       readings: [
       ],
     };

-    const results = readingsOutsideRange(station, min, max);
+    const results = readingsOutsideRange(station, min, max, range);

     expect(results).toHaveLength(2);
     expect(results.some(r => r.temp === 9)).toBeTruthy();
```

And then we can remove the now unused `max` parameter from `readingsOutsideRange`:

```diff
diff --git a/src/caller.js b/src/caller.js
@@ -4,11 +4,6 @@
 const readingsOutsideRange = require('./readings-outside-range');

 const operatingPlan = { temperatureFloor: 50, temperatureCeiling: 55 };
 const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling);
-const alerts = readingsOutsideRange(
-  station,
-  operatingPlan.temperatureFloor,
-  operatingPlan.temperatureCeiling,
-  range
-);
+const alerts = readingsOutsideRange(station, operatingPlan.temperatureFloor, range);

 console.log(alerts);

diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,4 +1,4 @@
-function readingsOutsideRange(station, min, max, range) {
+function readingsOutsideRange(station, min, range) {
   return station.readings.filter(r => r.temp < min || r.temp > range.max);
 }

diff --git a/src/readings-outside-range/index.test.js b/src/readings-outside-range/index.test.js
@@ -15,7 +15,7 @@ describe('readingsOutsideRange', () => {
       ],
     };

-    const results = readingsOutsideRange(station, min, max, range);
+    const results = readingsOutsideRange(station, min, range);

     expect(results).toHaveLength(2);
     expect(results.some(r => r.temp === 9)).toBeTruthy();
```

The same happens for the `min` parameter. We first start using it from the `range`:

```diff
diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,5 +1,5 @@
 function readingsOutsideRange(station, min, range) {
-  return station.readings.filter(r => r.temp < min || r.temp > range.max);
+  return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
 }

 module.exports = readingsOutsideRange;
```

And then we remove it from `readingsOutsideRange` and update the callers:

```diff
diff --git a/src/caller.js b/src/caller.js
@@ -4,6 +4,6 @@
 const readingsOutsideRange = require('./readings-outside-range');

 const operatingPlan = { temperatureFloor: 50, temperatureCeiling: 55 };
 const range = new NumberRange(operatingPlan.temperatureFloor, operatingPlan.temperatureCeiling);
-const alerts = readingsOutsideRange(station, operatingPlan.temperatureFloor, range);
+const alerts = readingsOutsideRange(station, range);

 console.log(alerts);

diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,4 +1,4 @@
-function readingsOutsideRange(station, min, range) {
+function readingsOutsideRange(station, range) {
   return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
 }

diff --git a/src/readings-outside-range/index.test.js b/src/readings-outside-range/index.test.js
@@ -15,7 +15,7 @@ describe('readingsOutsideRange', () => {
       ],
     };

-    const results = readingsOutsideRange(station, min, range);
+    const results = readingsOutsideRange(station, range);

     expect(results).toHaveLength(2);
     expect(results.some(r => r.temp === 9)).toBeTruthy();
```

At this point, the refactoring is done. But we can move forward and make use of our new `NumberRange` class, adding some behavior to it. We can add a `contains` method, so it now can tell us whether a number is or isn't inside the range:

```diff
diff --git a/src/number-range/index.js b/src/number-range/index.js
@@ -10,6 +10,10 @@
class NumberRange {
   get max() {
     return this._data.max;
   }
+
+  contains(n) {
+    return n >= this.min && n <= this.max;
+  }
 }

 module.exports = { NumberRange };

diff --git a/src/number-range/index.test.js b/src/number-range/index.test.js
@@ -1,13 +1,36 @@
 const { NumberRange } = require('.');

 describe('NumberRange', () => {
-  it('should have a min and a max', () => {
-    const min = 10;
-    const max = 20;
+  const min = 10;
+  const max = 20;

+  it('should have a min and a max', () => {
     const range = new NumberRange(min, max);

     expect(range.min).toEqual(min);
     expect(range.max).toEqual(max);
   });
+
+  describe('contains', () => {
+    it('should return true if a number falls inside of the specified range', () => {
+      const range = new NumberRange(min, max);
+      expect(range.contains(15)).toEqual(true);
+    });
+
+    it('should return false if a number falls outside of the specified range', () => {
+      const range = new NumberRange(min, max);
+      expect(range.contains(9)).toEqual(false);
+      expect(range.contains(21)).toEqual(false);
+    });
+
+    it('should contain the lower end of the range', () => {
+      const range = new NumberRange(min, max);
+      expect(range.contains(min)).toEqual(true);
+    });
+
+    it('should contain the upper end of the range', () => {
+      const range = new NumberRange(min, max);
+      expect(range.contains(max)).toEqual(true);
+    });
+  });
 });
```

And, finally, we can use the `NumberRange.contains` method at `readingsOutsideRange`:

```diff
diff --git a/src/readings-outside-range/index.js b/src/readings-outside-range/index.js
@@ -1,5 +1,5 @@
 function readingsOutsideRange(station, range) {
-  return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
+  return station.readings.filter(r => !range.contains(r.temp));
 }

 module.exports = readingsOutsideRange;
```

And that's it for this refactoring!

### Commit history

| Commit SHA                                                                                                                        | Message                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [1fec692](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/1fec6926a2cb426703000dd116ebf704e86ed239) | introduce `NumberRange` class                                                                  |
| [8b4fed3](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/8b4fed393834fb78de47a7cb4323042ab8a969de) | add `range` as a parameter to `readingsOutsideRange`                                           |
| [58182d4](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/58182d471e5c5c0a6bbaf6b1a892f13dfbfd27cc) | update caller to instantiate a `NumberRange` object and pass it down to `readingsOutsideRange` |
| [c95a67f](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/c95a67f6066e55d77f5194f6346f2f6561d8dc7e) | start using the `max` field from the `range` obj at `readingsOutsideRange`                     |
| [8db05b1](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/8db05b172223eb8fbc4f4bca332b3266b06db86a) | remove now unused `max` parameter from `readingsOutsideRange`                                  |
| [7befc10](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/7befc109b7c5b08b306eb0db29b41f36e3b5b85e) | start using the `min` field from the `range` obj at `readingsOutsideRange`                     |
| [2932a1a](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/2932a1aac9978c9f94e815d4eb8c30b4aba548bb) | remove now unused `min` field from `readingsOutsideRange` and update callers accordingly       |
| [61ec951](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/61ec9514d44818aecdb1255fb3322da06b34b616) | add `contains` method to `NumberRange`                                                         |
| [88378c7](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commit/88378c7e136736a911c3188ceaadb4798c98aa8c) | use `NumberRange.contains` method at `readingsOutsideRange`                                    |

You can also see the full commit history in the [Commit History tab](https://github.com/kaiosilveira/introduce-parameter-object-refactoring/commits/main).

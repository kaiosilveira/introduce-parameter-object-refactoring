class NumberRange {
  constructor(min, max) {
    this._data = { min, max };
  }

  get min() {
    return this._data.min;
  }

  get max() {
    return this._data.max;
  }

  contains(n) {
    return n >= this.min && n <= this.max;
  }
}

module.exports = { NumberRange };

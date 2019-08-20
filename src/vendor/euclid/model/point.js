import { Geom } from './geom';

class Point extends Geom {
  constructor(name, x, y) {
    if (typeof y === 'undefined') {
      y = x;
      x = name;
      name = null;
    }
    super(name);
    this.x = x;
    this.y = y;
    this.free = true;
  }

  toString() {
    return super.toString() + '(' + this.x + ',' + this.y + ')';
  }

  /* shorthand function for constructing a point from coodinates */
  static P(name, x, y) {
    return new Point(name, x, y);
  }
}

export { Point };

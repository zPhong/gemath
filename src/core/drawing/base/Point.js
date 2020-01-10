import GeoObjectModelBase from "./GeoObjectModelBase";

class Point extends GeoObjectModelBase{
  constructor({name, x, y}) {
    super(name);
    this.name = name;
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${super.toString()}(${this.x},${this.y})`;
  }

  static createPoint(name, x, y) {
    return new Point({name, x, y});
  }
}

export default Point;
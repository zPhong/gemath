import GeoObjectModelBase from "./GeoObjectModelBase";

class Line extends GeoObjectModelBase{
  constructor({name, x, y}) {
    super(name);
    this.name = name;
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${super.toString()}(${this.x},${this.y})`;
  }

  static createLine(name, x, y) {
    return new Line({name, x, y});
  }
}

export default Line;
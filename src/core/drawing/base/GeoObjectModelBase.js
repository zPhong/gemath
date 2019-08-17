class GeoObjectModelBase {
  constructor(objName) {
    this.name = objName;
  }

  toString() {
    return this.name;
  }
}

export default GeoObjectModelBase;
const LINEAR = 'Linear';
const CIRCLE = 'Circle';
const FORMAT_ERROR = 'Format Error';

class Equation {
  constructor({a, b, c, d, e}) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;

    this.type = undefined;

    this.getType = this.getType.bind(this);
    this.toString = this.toString.bind(this);
  }

  toString() {
    let toStringValue = FORMAT_ERROR;

    if (this.getType() === LINEAR) {
      toStringValue = `${this.c}x + ${this.d}y + ${this.e} = 0`;
    }
    else if (this.getType() === CIRCLE) {
      toStringValue = `${this.a}x2 + ${this.b}y2 + ${this.c}x + ${this.d}y + ${this.e} = 0`;
    }

    return toStringValue;
  }

  getType() {
    let type = FORMAT_ERROR;
    if (this.a === 0 && this.b === 0) {
      type = LINEAR;
    }
    else if (this.a === 1 && this.b === 1) {
      type = CIRCLE;
    }
    return type;
  }

  get coefficientX() {
    return {
      a: this.a,
      c: this.c,
    };
  }

  get coefficientY() {
    return {
      b: this.b,
      d: this.d,
    };
  }

  get A() {
    return this.a;
  }

  get B() {
    return this.b;
  }

  get C() {
    return this.c;
  }

  get D() {
    return this.d;
  }

  get E() {
    return this.e;
  }
}

export default Equation;
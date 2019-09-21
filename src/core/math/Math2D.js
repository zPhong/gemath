import GConst from '../../utils/values';
import type {
  CalculatedResultType,
  CircleType,
  CoordinateType,
  EquationType,
  LineType,
} from '../../utils/types';
import {
  convertEquationToLineType,
  convertLinearToEquation,
  convertLineTypeToEquation,
} from './Converter';
import { getRandomPointInEquation } from './Generation';
import ErrorService from '../../utils/ErrorHandleService';
import { Operation } from './MathOperation';

const MIN = GConst.Number.MIN_RANDOM_NUMBER;
const MAX = GConst.Number.MAX_RANDOM_NUMBER;
const INFINITY = GConst.String.INFINITY;
const IMPOSSIBLE = GConst.String.IMPOSSIBLE;
const NOT_BE_IN_LINE = GConst.String.NOT_BE_IN_LINE;

const {
  Add,
  Sub,
  Multiply,
  Divide,
  Sqrt,
  Pow,
  isEqual,
  Compare,
  isZero,
  Abs,
  isSmallerThanZero,
  Round,
  Max,
} = Operation;

function _makeRound(num: CalculatedResultType, f: number = 3): number {
  if (typeof num === 'string') {
    return Round(num, f);
  }
  if (isNaN(num)) {
    throw console.error('error', num);
  }
  const myF = Math.pow(10, f);
  return Math.round(num * myF) / myF;
}

export function calculateVector(
  firstPoint: CoordinateType,
  secondPoint: CoordinateType,
  isMakeRound? = true,
): CoordinateType {
  const x = Operation.Sub(secondPoint.x, firstPoint.x);
  const y = Operation.Sub(secondPoint.y, firstPoint.y);

  if (isMakeRound) {
    return {
      x: _makeRound(x),
      y: _makeRound(y),
    };
  }
  return {
    x,
    y,
  };
}

export function isVectorSameDirection(firstVector: CoordinateType, secondVector: CoordinateType): boolean {
  if (isZero(firstVector.x)) {
    return (
      isZero(secondVector.x) &&
      isEqual(Divide(firstVector.y, Abs(firstVector.y)), Divide(secondVector.y, Abs(secondVector.y)))
    );
  }

  if (isZero(firstVector.y)) {
    return (
      isZero(secondVector.y) &&
      isEqual(Divide(firstVector.x, Abs(firstVector.x)), Divide(secondVector.x, Abs(secondVector.x)))
    );
  }

  if (isZero(secondVector.x)) {
    return (
      isZero(firstVector.x) &&
      isEqual(Divide(firstVector.y, Abs(firstVector.y)), Divide(secondVector.y, Abs(secondVector.y)))
    );
  }

  if (isZero(secondVector.y)) {
    return (
      isZero(firstVector.y) &&
      isEqual(Divide(firstVector.x, Abs(firstVector.x)), Divide(secondVector.x, Abs(secondVector.x)))
    );
  }

  return (
    isEqual(Divide(firstVector.x, Abs(firstVector.x)), Divide(secondVector.x, Abs(secondVector.x))) &&
    isEqual(Divide(firstVector.y, Abs(firstVector.y)), Divide(secondVector.y, Abs(secondVector.y))) &&
    isEqual(_makeRound(Multiply(firstVector.x, secondVector.y)), _makeRound(Multiply(firstVector.y, secondVector.x)))
  );
}

export function isVectorInSameLine(firstVector: CoordinateType, secondVector: CoordinateType): boolean {
  if (isZero(firstVector.x)) {
    return isZero(secondVector.x);
  }

  if (isZero(firstVector.y)) {
    return isZero(secondVector.y);
  }

  if (isZero(secondVector.x)) {
    return isZero(firstVector.x);
  }

  if (isZero(secondVector.y)) {
    return isZero(firstVector.y);
  }

  return isEqual(
    _makeRound(Multiply(firstVector.x, secondVector.y)),
    _makeRound(Multiply(firstVector.y, secondVector.x)),
  );
}

export function calculateMiddlePoint(firstPoint: CoordinateType, secondPoint: CoordinateType): CoordinateType {
  const x = Divide(Add(firstPoint.x, secondPoint.x), 2);
  const y = Divide(Add(firstPoint.y, secondPoint.y), 2);
  return {
    x,
    y,
  };
}

export function calculateSymmetricalPoint(
  firstPoint: CoordinateType,
  secondPoint: CoordinateType,
  isRight: boolean = true,
): CoordinateType {
  return isRight
    ?
    {
      x: Sub(Multiply(2, secondPoint.x), firstPoint.x),
      y: Sub(Multiply(2, secondPoint.y), firstPoint.y),
    }
    :
    {
      x: Sub(Multiply(2, firstPoint.x), secondPoint.x),
      y: Sub(Multiply(2, firstPoint.y), secondPoint.y),
    };
}

export function getLineFromTwoPoints(p1: CoordinateType, p2: CoordinateType): EquationType {
  const directionVector = {
    a: Sub(p2.x, p1.x),
    b: Sub(p2.y, p1.y),
  };
  const normalVector = {
    a: Sub(0, directionVector.b),
    b: directionVector.a,
  };

  return {
    a: 0,
    b: 0,
    c: normalVector.a,
    d: normalVector.b,
    //-normalVector.a * p1.x - normalVector.b * p1.y
    e: Sub(Multiply(Sub(0, normalVector.a), p1.x), Multiply(normalVector.b, p1.y)),
  };
}

export function calculateParallelEquation(equation: EquationType): EquationType {
  // Random a constance term from MIN_RANDOM_NUMBER -> MAX_RANDOM_NUMBER
  const e = Math.floor(Math.random() * 100) - MAX;

  let parallelEquation: EquationType = {};
  parallelEquation.c = equation.c;
  parallelEquation.d = equation.d;
  parallelEquation.e = e;

  return parallelEquation;
}

export function calculatePerpendicularEquation(equation: EquationType): EquationType {
  // Random a constance term from MIN_RANDOM_NUMBER -> MAX_RANDOM_NUMBER
  const e = Math.floor(Math.random() * 100) - MIN;

  let perpendicularEquation: EquationType = {};
  perpendicularEquation.c = Sub(0, equation.c);
  perpendicularEquation.d = equation.d;
  perpendicularEquation.e = e;

  return perpendicularEquation;
}

export function calculateDistanceTwoPoints(
  firstPoint: CoordinateType,
  secondPoint: CoordinateType,
): CalculatedResultType {
  const squareX = Pow(Sub(secondPoint.x, firstPoint.x), 2);
  const squareY = Pow(Sub(secondPoint.y, firstPoint.y), 2);
  return Sqrt(Add(squareX, squareY));
}

export function calculateDistanceFromPointToLine(point: CoordinateType, line: EquationType): CalculatedResultType {
  let numerator = Abs(Add(Add(Multiply(line.c, point.x), Multiply(line.d, point.y)), line.e));
  let denominator = Sqrt(Add(Pow(line.c, 2), Pow(line.d, 2)));

  if (isZero(denominator)) {
    return INFINITY;
  }
  return Divide(numerator, denominator);
}

export function calculateParallelLineByPointAndLine(point: CoordinateType, line: EquationType): EquationType {
  // parallel line has `a` coefficient equals the other line.
  // parallel line's e = -ax - y with (x,y) is coordinate of the point
  const lineEquation = convertEquationToLineType(line);
  const parLine: LineType = {};
  parLine.a = lineEquation.a;
  parLine.b = Sub(point.y, Multiply(lineEquation.a, point.x));

  let result = convertLineTypeToEquation(parLine);
  if (isZero(line.d)) {
    result.d = line.d;
  }
  return result;
}

export function calculatePerpendicularLineByPointAndLine(point: CoordinateType, line: EquationType): EquationType {
  let perpendicularLine: EquationType = {};

  // perpendicular line has the direction vector is opposite pairs with the other line.
  // perpendicular line's e = -ax - y with (x,y) is coordinate of the point
  if (isZero(line.c)) {
    perpendicularLine.c = -1 / line.d;
    perpendicularLine.d = 0;
    perpendicularLine.e = -perpendicularLine.c * point.x;
  }
  else if (isZero(line.d)) {
    perpendicularLine.c = 0;
    perpendicularLine.d = Divide(-1, line.c);
    perpendicularLine.e = Multiply(Sub(0, perpendicularLine.d), point.y);
  }
  else {
    const lineEquation = convertEquationToLineType(line);
    const perLine: LineType = {};
    perLine.a = Divide(-1, lineEquation.a);
    perLine.b = Add(point.y, Divide(point.x, lineEquation.a));

    perpendicularLine = convertLineTypeToEquation(perLine);
  }

  return perpendicularLine;
}

export function calculateIntersectionByLineAndLine(lineOne: EquationType, lineTwo: EquationType): CoordinateType {
  let r = calculateSetOfEquationTypeAndQuadraticEquation(
    {
      c: lineOne.c,
      d: lineOne.d,
      e: lineOne.e,
    },
    {
      a: 0,
      b: 0,
      c: lineTwo.c,
      d: lineTwo.d,
      e: lineTwo.e,
    },
  );

  if (Array.isArray(r)) {
    if (r.length === 0) {
      return [];
    }
    else {
      return r;
    }
  }
}

export function calculateCircleEquationByCenterPoint(
  centerPoint: CoordinateType,
  radius: CalculatedResultType,
): TwoVariableQuadraticEquation {
  //const roundedRadius = _makeRound(radius, 6);
  return {
    a: 1,
    b: 1,
    c: Multiply(-2, centerPoint.x),
    d: Multiply(-2, centerPoint.y),
    //centerPoint.x * centerPoint.x + centerPoint.y * centerPoint.y - radius * radius
    e: Sub(Add(Pow(centerPoint.x, 2), Pow(centerPoint.y, 2)), Pow(radius, 2)),
  };
}

export function calculateInternalBisectLineEquation(
  lineOne: EquationType,
  lineTwo: EquationType,
  pointOne: CoordinateType,
  pointTwo: CoordinateType,
): EquationType {
  const results = _calculateBisectLineEquation(lineOne, lineTwo);
  const firstLine: EquationType = results[0];
  const secondLine: EquationType = results[1];

  if (isZero(getAngleFromTwoLines(lineOne, lineTwo))) {
    throw new Map().set('error', 'không hỗ trợ trường hợp này');
  }

  return _getInternalBisectLineEquation(firstLine, secondLine, pointOne, pointTwo);
}

export function calculateExternalBisectLineEquation(
  lineOne: EquationType,
  lineTwo: EquationType,
  pointOne: CoordinateType,
  pointTwo: CoordinateType,
): EquationType {
  let results = _calculateBisectLineEquation(lineOne, lineTwo);
  const firstLine: EquationType = results[0];
  const secondLine: EquationType = results[1];

  if (isZero(getAngleFromTwoLines(lineOne, lineTwo))) {
    throw new Map().set('error', 'không hỗ trợ trường hợp này');
  }

  const internalLine = _getInternalBisectLineEquation(firstLine, secondLine, pointOne, pointTwo);

  results = results.filter((line: EquationType): boolean => JSON.stringify(line) !== JSON.stringify(internalLine));
  return results[0];
}

function _calculateBisectLineEquation(lineOne: EquationType, lineTwo: EquationType): [EquationType, EquationType] {
  let resultOne: EquationType = {};
  let resultTwo: EquationType = {};

  // ax + by + c = +/- [sqrt(a*a + b*b) / sqrt(a'*a' + b'*b')] * (a'x + b'y + c)

  // check if denominator equals 0
  if (isZero(lineTwo.c * lineTwo.c + lineTwo.d * lineTwo.d)) {
    return;
  }

  // Represent for [sqrt(a*a + b*b) / sqrt(a'*a' + b'*b')]
  //   Math.sqrt(lineOne.c * lineOne.c + lineOne.d * lineOne.d)
  //  /Math.sqrt(lineTwo.c * lineTwo.c + lineTwo.d * lineTwo.d);

  let coefficient = Divide(
    Sqrt(Add(Multiply(lineOne.c, lineOne.c), Multiply(lineOne.d, lineOne.d))),
    Sqrt(Add(Multiply(lineTwo.c, lineTwo.c), Multiply(lineTwo.d, lineTwo.d))),
  );

  /*
   * Two results:
   *    (a - coefficient*a')x + (b - coefficient*b')y + c - coefficient*c' = 0
   *    (a + coefficient*a')x + (b + coefficient*b')y + c + coefficient*c' = 0
   */
  resultOne.c = Sub(lineOne.c, Multiply(coefficient, lineTwo.c));
  resultOne.d = Sub(lineOne.d, Multiply(coefficient, lineTwo.d));
  resultOne.e = Sub(lineOne.e, Multiply(coefficient, lineTwo.e));

  resultTwo.c = Add(lineOne.c, Multiply(coefficient, lineTwo.c));
  resultTwo.d = Add(lineOne.d, Multiply(coefficient, lineTwo.d));
  resultTwo.e = Add(lineOne.e, Multiply(coefficient, lineTwo.e));

  return [
    resultOne,
    resultTwo,
  ];
}

/*
 *   Line one and line two is 2 lines are the result of _calculateBisectLineEquation function
 *   Point one and point two are 2 points that each point located in each line
 *             which is equivalent each argument in _calculateBisectLineEquation function
 */
function _getInternalBisectLineEquation(
  lineOne: EquationType,
  lineTwo: EquationType,
  pointOne: CoordinateType,
  pointTwo: CoordinateType,
): EquationType {
  //pointOne.x * lineOne.c + pointOne.y * lineOne.d + lineOne.e
  let firstEquation = Add(Add(Multiply(pointOne.x, lineOne.c), Multiply(pointOne.y, lineOne.d)), lineOne.e);
  let secondEquation = Add(Add(Multiply(pointTwo.x, lineOne.c), Multiply(pointTwo.y, lineOne.d)), lineOne.e);

  return Compare(Multiply(firstEquation, secondEquation), 0) > 0 ?
    lineTwo :
    lineOne;
}

// TODO: Uncheck
export function calculateSetOfEquationTypes(d1: EquationType, d2: EquationType) {
  if (
    (isZero(d1.c) && isZero(d2.c)) ||
    (isZero(d1.d) && isZero(d2.d)) ||
    (isZero(d1.c) && isZero(d1.d)) ||
    (isZero(d2.c) && isZero(d2.d))
  ) {
    return IMPOSSIBLE;
  }
  if (isZero(d1.c) && isZero(d2.d)) {
    return {
      x: Sub(0, Divide(d2.e, d2.c)),
      y: Sub(0, Divide(d1.e, d1.d)),
    };
  }
  if (isZero(d2.c) && isZero(d1.d)) {
    return {
      x: Sub(0, Divide(d1.e, d1.c)),
      y: Sub(0, Divide(d2.e, d2.d)),
    };
  }
  if (isZero(d1.e) && isZero(d2.e)) {
    return {
      x: 0,
      y: 0,
    };
  }

  if (isZero(d1.c)) {
    const tempY = Sub(0, Divide(d1.e, d1.d));
    return {
      //(-d2.e - tempY * d2.d) / d2.c
      x: Sub(0, Divide(Add(d2.e, Multiply(tempY, d2.d)), d2.c)),
      y: tempY,
    };
  }

  if (isZero(d1.d)) {
    const tempX = Sub(0, Divide(d1.e, d1.c));

    return {
      x: tempX,
      y: Sub(0, Divide(Add(d2.e, Multiply(tempX, d2.c)), d2.d)),
    };
  }

  if (isZero(d2.c)) {
    const tempY = Sub(0, Divide(d2.e, d2.d));
    return {
      x: Sub(0, Divide(Add(d1.e, Multiply(tempY, d1.d)), d1.c)),
      y: tempY,
    };
  }

  if (isZero(d2.d)) {
    const tempX = Sub(0, Divide(d2.e, d2.c));

    return {
      x: tempX,
      y: Sub(0, Divide(Add(d1.e, Multiply(tempX, d1.c)), d1.d)),
    };
  }
  //(d1.e * d2.c - d1.c * d2.e) / (d1.d * d2.c - d1.c * d2.d)

  const tempY = Divide(
    Sub(Multiply(d1.e, d2.c), Multiply(d1.c * d2.e)),
    Sub(Multiply(d1.d, d2.c), Multiply(d1.c * d2.d)),
  );

  return {
    x: Sub(0, Divide(Add(d1.e, Multiply(tempY, d1.d)), d1.c)),
    y: tempY,
  };
}

/*
 *  Find point(s) of intersection between a linear equation and a circle equation.
 *  @params:
 *        + d (EquationType): a line.
 *        + c (CircleEquation): a circle.
 *  @return:
 *        + IMPOSSIBLE: if distance from center point of the circle to the line is greater than the radius.
 *        + (Array<Object>): if the line intersects the circle.
 *          + length = 1;
 *          + length = 2;
 */
export function calculateIntersectionEquationTypeWithCircleEquation(
  d: EquationType,
  q: EquationType,
): Array<CoordinateType> {
  const A = Divide(q.c, -2);
  const B = Divide(q.d, -2);

  console.log(d, Round(A), Round(B), Round(Sqrt(Sub(Add(Pow(A, 2), Pow(B, 2)), q.e))));

  const centerPoint: CoordinateType = {
    x: A,
    y: B,
  };
  const distanceFromCenterPointToLine = calculateDistanceFromPointToLine(centerPoint, d);

  if (Compare(distanceFromCenterPointToLine, Sqrt(Sub(Add(Pow(A, 2), Pow(B, 2)), q.e))) > 0) {
    console.log(Round(distanceFromCenterPointToLine), Round(Sqrt(Sub(Add(Pow(A, 2), Pow(B, 2)), q.e))));
    return IMPOSSIBLE;
  }
  else {
    return calculateSetOfEquationTypeAndQuadraticEquation(d, q);
  }
}

/*
 * Solves a quadratic equation. This equation is defined: Ax2 + Bx + C = 0.
 *
 *  @params:
 *        + a (number): represents x's coefficient.
 *        + b (number): represents y's coefficient.
 *        + c (number): represents constant term.
 * @return:
 *        + IMPOSSIBLE (string): if the equation is no root.
 *        + (number): if the equation has only ONE root.
 *        + x1, x2 (Object): if the equation has TWO root.
 */
export function calculateQuadraticEquation(
  a: CalculatedResultType,
  b: CalculatedResultType,
  c: CalculatedResultType,
): CalculatedResultType {
  const delta = Sub(Pow(b, 2), Multiply(4, Multiply(a, c)));

  let firstRoot,
    secondRoot: CalculatedResultType = undefined;
  if (isZero(a)) {
    if (isZero(b)) {
      return [];
    }
    return Sub(0, Divide(c, b));
  }
  else if (isSmallerThanZero(delta)) {
    return [];
  }
  else if (isZero(delta)) {
    return Sub(0, Divide(b, Multiply(2, a)));
    //(-b + Math.sqrt(delta)) / (2 * a)
    firstRoot = Divide(Add(Sub(0, b), Sqrt(delta)), Multiply(2, a));
  }
  else {
    secondRoot = Divide(Sub(Sub(0, b), Sqrt(delta)), Multiply(2, a));
    return [
      firstRoot,
      secondRoot,
    ];
  }
}

// Ax2 + By2 + Cx + Dy + E = 0
export function isIn(p: CoordinateType, e: EquationType): boolean {
  if (p.x === undefined || p.y === undefined) {
    return false;
  }
  if (e.a === undefined) {
    e = convertLinearToEquation(e);
  }
  // e.a * p.x * p.x + e.b * p.y * p.y + e.c * p.x + e.d * p.y + e.e

  const temp = Add(
    Add(Add(Multiply(e.a, Pow(p.x, 2)), Multiply(e.b, Pow(p.y, 2))), Add(Multiply(e.c, p.x), Multiply(e.d, p.y))),
    e.e,
  );

  return isZero(Round(temp));
}

/*
 *  Solves a set of a linear equation and quadratic equation.
 *  Linear equation is defined:     Ax + By + C = 0.
 *  Quadratic equation is defined:  Ax2 + By2 + Cx + Dy + E = 0.
 *
 *  @params:
 *        + l (EquationType): represents a linear equation.
 *        + q (QuadraticEquation): represents a quadratic equation.
 *  @return:
 *        + IMPOSSIBLE (string): if the set is no root.
 *        + (number): if the set has only ONE root.
 *        + x1, x2 (Object): if the set has TWO root.
 */
export function calculateSetOfEquationTypeAndQuadraticEquation(l: EquationType, q: EquationType): Array<Object> {
  let results: Array<Object> = [];
  let u, v, w;

  const A = l.c;
  const B = l.d;
  const C = l.e;
  const D = q.a;
  const E = q.b;
  const F = q.c;
  const G = q.d;
  const H = q.e;

  if (A !== 0) {
    //A * A * E + D * B * B
    u = Add(Multiply(Pow(A, 2), E), Multiply(Pow(B, 2), D));
    //2 * B * C * D - A * B * F + A * A * G
    v = Add(Sub(Multiply(Multiply(2, B), Multiply(C, D)), Multiply(A, Multiply(B, F))), Multiply(Pow(A, 2), G));

    //D * C * C - A * C * F + A * A * H
    w = Sub(Add(Multiply(D, Pow(C, 2)), Multiply(H, Pow(A, 2))), Multiply(A, Multiply(C, F)));

    // solves x. Unneeded check IMPOSSIBLE.
    const root = calculateQuadraticEquation(u, v, w);
    if (typeof root === 'object') {
      const r1 = root.firstRoot;
      const r2 = root.secondRoot;
      results.push(
        {
          x: Divide(Sub(0, Add(C, Multiply(B, r1))), A),
          y: r1,
        },
        {
          x: Divide(Sub(0, Add(C, Multiply(B, r2))), A),
          y: r2,
        },
      );
    }
    else if (root === IMPOSSIBLE) {
      return root;
    }
    else {
      results.push({
        x: Divide(Sub(0, Add(C, Multiply(B, root))), A),
        y: root,
      });
    }
  }
  else {
    //q.a * l.d * l.d
    u = Multiply(q.a, Pow(l.d, 2));
    //q.c * l.d * l.d
    v = Multiply(q.c, Pow(l.d, 2));
    //q.b * l.e * l.e - q.d * l.d * l.e + q.e * l.d * l.d
    w = Add(
      Sub(Multiply(q.b, Pow(l.e, 2)), Multiply(Multiply(q.d, l.d), Multiply(q.e, l.e))),
      Multiply(q.e, Pow(l.d, 2)),
    );

    // solves x. Unneeded check IMPOSSIBLE.
    const root = calculateQuadraticEquation(u, v, w);

    console.log(root);

    if (typeof root === 'object') {
      results.push(
        {
          x: root.firstRoot,
          y: Divide(Sub(0, l.e), l.d),
        },
        {
          x: root.secondRoot,
          y: Divide(Sub(0, l.e), l.d),
        },
      );
    }
    else if (root === IMPOSSIBLE) {
      return root;
    }
    else {
      results.push({
        x: root,
        y: Divide(Sub(0, l.e), l.d),
      });
    }
  }
  return results;
}

export function calculateIntersectionTwoCircleEquations(firstEquation: EquationType, secondEquation: EquationType) {
  let results: Array<Object> = [];
  if (!firstEquation || !secondEquation) {
    return [];
  }
  let q1, q2;
  firstEquation.a === undefined ?
    (q1 = convertLinearToEquation(firstEquation)) :
    (q1 = firstEquation);
  secondEquation.a === undefined ?
    (q2 = convertLinearToEquation(secondEquation)) :
    (q2 = secondEquation);

  if (!isEqual(q1.a, q2.a) && !isEqual(q1.b, q2.b)) {
    if (isZero(q1.a) && isZero(q1.b)) {
      // q2 is a quadratic equation
      return calculateIntersectionEquationTypeWithCircleEquation(q1, q2);
    }
    else {
      // q1 is a quadratic equation
      return calculateIntersectionEquationTypeWithCircleEquation(q2, q1);
    }
  }
  else if (isZero(q1.a) && isZero(q1.b) && isZero(q2.a) && isZero(q2.b)) {
    results.push(calculateSetOfEquationTypes(q1, q2));
  }
  else {
    // a x2 + b y2 + Ax + By + C = 0
    // a'x2 + b'y2 + Dx + Ey + G = 0
    const D = q2.c;
    const E = q2.d;
    const G = q2.e;

    // Z = a - a'
    const Z = Compare(q1.a, q2.a) > 0 ?
      q1.a :
      q2.a;
    const _D = isEqual(Z, q1.a) ?
      q1.c :
      D;
    const _E = isEqual(Z, q1.a) ?
      q1.d :
      E;
    const _G = isEqual(Z, q1.a) ?
      q1.e :
      G;

    const a = isEqual(Z, q1.a) ?
      Sub(q1.c, D) :
      Sub(D, q1.c);
    const b = isEqual(Z, q1.a) ?
      Sub(q1.d, E) :
      Sub(E, q1.d);
    const c = isEqual(Z, q1.a) ?
      Sub(q1.e, G) :
      Sub(G, q1.e);

    if (isZero(a) || isZero(b)) {
      return IMPOSSIBLE;
    }
    else {
      const u = Multiply(Z, Add(Pow(b, 2), Pow(a, 2)));
      // 2 * b * c * Z - _D * a * b + _E * a * a
      const v = Sub(
        Add(Multiply(Multiply(2, b), Multiply(c, Z)), Multiply(_E, Pow(a, 2))),
        Multiply(_D, Multiply(a, b)),
      );
      //Z * c * c - _D * a * c + _G * a * a
      const w = Sub(Add(Multiply(Z, Pow(c, 2)), Multiply(_G, Pow(a, 2))), Multiply(_D, Multiply(a, c)));

      const roots = calculateQuadraticEquation(u, v, w);
      if (roots === IMPOSSIBLE) {
        return roots;
      }
      else if (typeof roots === 'object') {
        const r1 = roots.firstRoot;
        const r2 = roots.secondRoot;
        results.push(
          {
            x: Divide(Sub(0, Add(c, Multiply(b, r1))), a),
            y: r1,
          },
          {
            x: Divide(Sub(0, Add(c, Multiply(b, r2))), a),
            y: r2,
          },
        );
      }
      else {
        results.push({
          x: Divide(Sub(0, Add(c, Multiply(b, roots))), a),
          y: roots,
        });
      }
    }
  }
  return results;
}

export function calculateLinesByAnotherLineAndAngle(
  rootPoint: CoordinateType,
  staticPoint: CoordinateType,
  dynamicPoint: CoordinateType,
  angle: number,
): EquationType {
  const equations = _calculateLinesByAnotherLineAndAngle(
    getLineFromTwoPoints(rootPoint, staticPoint),
    dynamicPoint,
    angle,
  );
  let index = 0;
  const newRootPoints = equations
    .map((equation: EquationType): CoordinateType => {
      return calculateIntersectionByLineAndLine(getLineFromTwoPoints(rootPoint, staticPoint), equation);
    })
    .filter((newRootPoint: CoordinateType, i): boolean => {
      const staticVector = calculateVector(rootPoint, staticPoint, false);
      const dynamicVector = calculateVector(newRootPoint, dynamicPoint, false);
      const result = calculateAngleTwoVector(staticVector, dynamicVector) === parseInt(angle);
      if (result) {
        index = i;
      }
      return result;
    });
  if (newRootPoints[0]) {
    return equations[index];
  }

  ErrorService.showError('500');
  return null;
}

function calculateIntegratedDirection(vectorOne: CoordinateType, vectorTwo: CoordinateType): number {
  return Add(Multiply(vectorOne.x, vectorTwo.x), Multiply(vectorOne.y, vectorTwo.y));
}

function calculateVectorLength(vector: CoordinateType): number {
  return Sqrt(Add(Pow(vector.x, 2), Pow(vector.y, 2)));
}

export function calculateAngleTwoVector(vectorOne: CoordinateType, vectorTwo: CoordinateType): number {
  if ((isZero(vectorOne.x) && isZero(vectorOne.y)) || (isZero(vectorTwo.x) && isZero(vectorTwo.y))) {
    return 0;
  }
  return Round(
    `(acos(
     ${Divide(
      calculateIntegratedDirection(vectorOne, vectorTwo),
      Multiply((calculateVectorLength(vectorOne), calculateVectorLength(vectorTwo))),
    )})*180)/PI`,
    1,
  );
}

export function _calculateLinesByAnotherLineAndAngle(d: EquationType, p: CoordinateType, angle: number) {
  let results: Array<EquationType> = [];

  const cosine = `cos((${angle} * PI) / 180)`;
  //d.c * d.c - cosine * cosine * d.c * d.c - cosine * cosine * d.d * d.d
  const A = Sub(Sub(Pow(d.c, 2), Multiply(Pow(cosine, 2), Pow(d.c, 2)), Multiply(Pow(cosine, 2), Pow(d.d, 2))));
  const B = Multiply(2, Multiply(d.c, d.d));
  //d.d * d.d - cosine * cosine * d.c * d.c - cosine * cosine * d.d * d.d;
  const C = Sub(Sub(Pow(d.d, 2), Multiply(Pow(cosine, 2), Pow(d.c, 2)), Multiply(Pow(cosine, 2), Pow(d.d, 2))));
  const root = calculateQuadraticEquation(A, B, C);

  if (typeof root === 'object') {
    results.push(
      {
        c: root.firstRoot,
        d: 1,
        //-root.firstRoot * p.x - p.y
        e: Sub(0, Add(Multiply(root.firstRoot, p.x), p.y)),
      },
      {
        c: root.secondRoot,
        d: 1,
        e: Sub(0, Add(Multiply(root.secondRoot, p.x), p.y)),
      },
    );
  }
  else if (root === IMPOSSIBLE) {
    return root;
  }
  else {
    results.push({
      c: root,
      d: 1,
      e: Sub(0, Add(Multiply(root, p.x), p.y)),
    });
  }

  return results;
}

export function makeRoundCoordinate(point: CoordinateType, f: number = 3) {
  if (typeof point === 'string') {
    return point;
  }
  return {
    x: Round(point.x, f),
    y: Round(point.y, f),
  };
}

export function getAngleFromTwoLines(d1: EquationType, d2: EquationType): number {
  if (
    d1.a ||
    d1.b ||
    d2.a ||
    d2.b ||
    (isZero(d1.c) && isZero(d1.d) && isZero(d1.e)) ||
    (isZero(d2.c) && isZero(d2.d) && isZero(d2.e))
  ) {
    return -9999;
  }

  const a1 = d1.c;
  const a2 = d2.c;
  const b1 = d1.d;
  const b2 = d2.d;

  const result = `acos(${Divide(
    Abs(Add(Multiply(a1, a2), Multiply(b1, b2))),
    Sqrt(Multiply(Add(Pow(a1, 2), Pow(b1, 2)), Add(Pow(a2, 2), Pow(b2, 2)))),
  )} * 180) / PI`;

  // round result
  return Round(result, 1);
}

export function getMiddlePointFromThreePointsInALine(
  p1: CoordinateType,
  p2: CoordinateType,
  p3: CoordinateType,
): CoordinateType {
  const line = getLineFromTwoPoints(p1, p2);
  if (
    !isIn(p3, {
      a: 0,
      b: 0,
      c: line.c,
      d: line.d,
      e: line.e,
    })
  ) {
    return NOT_BE_IN_LINE;
  }

  // another way: check vector =)))~
  const dis_p1_p2 = calculateDistanceTwoPoints(p1, p2);
  const dis_p2_p3 = calculateDistanceTwoPoints(p2, p3);
  const dis_p1_p3 = calculateDistanceTwoPoints(p1, p3);

  const max = Max(dis_p1_p2, dis_p2_p3, dis_p1_p3);
  if (isEqual(dis_p1_p2, max)) {
    return p3;
  }
  else if (isEqual(dis_p1_p3, max)) {
    return p2;
  }
  else {
    return p1;
  }
}

export function calculateCircumCircleEquation(p1: CoordinateType, p2: CoordinateType, p3: CoordinateType): CircleType {
  const midPerpendicularsLineOne = calculatePerpendicularLineByPointAndLine(
    calculateMiddlePoint(p1, p2),
    getLineFromTwoPoints(p1, p2),
  );

  const midPerpendicularsLineTwo = calculatePerpendicularLineByPointAndLine(
    calculateMiddlePoint(p1, p3),
    getLineFromTwoPoints(p1, p3),
  );

  const center = calculateIntersectionByLineAndLine(midPerpendicularsLineOne, midPerpendicularsLineTwo);
  const radius = calculateDistanceTwoPoints(center, p1);
  console.log(radius);
  const equation = calculateCircleEquationByCenterPoint(center, radius);

  return {
    center,
    radius,
    equation,
  };
}

export function calculateInCircleEquation(p1: CoordinateType, p2: CoordinateType, p3: CoordinateType): CircleType {
  const bisectorLineOne = calculateInternalBisectLineEquation(
    getLineFromTwoPoints(p1, p3),
    getLineFromTwoPoints(p1, p2),
    p2,
    p3,
  );

  const bisectorLineTwo = calculateInternalBisectLineEquation(
    getLineFromTwoPoints(p2, p3),
    getLineFromTwoPoints(p1, p2),
    p1,
    p3,
  );

  const center = calculateIntersectionByLineAndLine(bisectorLineOne, bisectorLineTwo);
  const radius = calculateDistanceFromPointToLine(center, getLineFromTwoPoints(p1, p3));

  const equation = calculateCircleEquationByCenterPoint(center, radius);
  return {
    center,
    radius,
    equation,
  };
}

export function calculateEscribedCirclesEquation(
  p1: CoordinateType,
  p2: CoordinateType,
  p3: CoordinateType,
  escribedPoint: CoordinateType,
): CircleType {
  const otherPoints = [
    p1,
    p2,
    p3,
  ].filter(
    (point: CoordinateType): boolean => JSON.stringify(point) !== JSON.stringify(escribedPoint),
  );

  if (otherPoints.length !== 2) {
    ErrorService.showError('300');
    return;
  }

  const bisectorLineOne = calculateInternalBisectLineEquation(
    getLineFromTwoPoints(escribedPoint, otherPoints[0]),
    getLineFromTwoPoints(escribedPoint, otherPoints[1]),
    otherPoints[0],
    otherPoints[1],
  );

  const bisectorLineTwo = calculateExternalBisectLineEquation(
    getLineFromTwoPoints(escribedPoint, otherPoints[0]),
    getLineFromTwoPoints(otherPoints[1], otherPoints[0]),
    escribedPoint,
    otherPoints[1],
  );

  const center = calculateIntersectionByLineAndLine(bisectorLineOne, bisectorLineTwo);
  const radius = calculateDistanceFromPointToLine(center, getLineFromTwoPoints(otherPoints[1], otherPoints[0]));

  console.log(getLineFromTwoPoints(otherPoints[1], otherPoints[0]));

  console.log(Round(center.x), Round(center.y), Round(radius));

  const equation = calculateCircleEquationByCenterPoint(center, radius);
  return {
    center,
    radius,
    equation,
  };
}

export function calculateTangentEquation(circle: EquationType, point?: CoordinateType = null): EquationType {
  const tangentPoint: CoordinateType = point || getRandomPointInEquation(circle);

  const tangentEquation: EquationType = {};

  const center = {
    x: Divide(circle.c, 2),
    y: Divide(circle.d, 2),
  };

  tangentEquation.a = 0;
  tangentEquation.b = 0;
  tangentEquation.c = Add(tangentPoint.x, center.x);
  tangentEquation.d = Add(tangentPoint.y, center.y);
  //circle.e + (circle.c * tangentPoint.x) / 2 + (circle.d * tangentPoint.y) / 2
  tangentEquation.e = Add(circle.e, Add(Multiply(tangentPoint.x, center.x), Multiply(tangentPoint.y, center.y)));

  return tangentEquation;
}

export function calculateTangentIntersectPointsByPointOutsideCircle(
  circle: EquationType,
  point?: CoordinateType = null,
  exceptionPoint?: CoordinateType = null,
): EquationType {
  const center: CoordinateType = {
    x: Divide(Sub(0, circle.c), 2),
    y: Divide(Sub(0, circle.d), 2),
  };

  const tempCircleCenter = calculateMiddlePoint(center, point);
  const tempCircleRadius = Divide(calculateDistanceTwoPoints(center, point), 2);

  const tempCircleEquation = calculateCircleEquationByCenterPoint(tempCircleCenter, tempCircleRadius);

  let roots = calculateIntersectionTwoCircleEquations(circle, tempCircleEquation);

  if (exceptionPoint) {
    roots = roots.filter((root: CoordinateType): boolean => JSON.stringify(root) !== JSON.stringify(exceptionPoint));
  }

  return roots;
}

export function isTwoEquationEqual(equationOne: EquationType, equationTwo: EquationType): boolean {
  return isZero(getAngleFromTwoLines(equationOne, equationTwo, 1));
}

export function isIsosceles(p1: CoordinateType, p2: CoordinateType, p3: CoordinateType): boolean {
  let result = false;
  if (calculateDistanceTwoPoints(p1, p2) === calculateDistanceTwoPoints(p1, p3)) {
    result = true;
  }
  else if (calculateDistanceTwoPoints(p2, p1) === calculateDistanceTwoPoints(p2, p3)) {
    result = true;
  }
  else if (calculateDistanceTwoPoints(p3, p2) === calculateDistanceTwoPoints(p3, p1)) {
    result = true;
  }
  return result;
}

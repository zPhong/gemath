import GConst from '../../utils/values';
import type {
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
import { distance } from '../../vendor/euclid/calc';

const MIN = GConst.Number.MIN_RANDOM_NUMBER;
const MAX = GConst.Number.MAX_RANDOM_NUMBER;
const INFINITY = GConst.String.INFINITY;
const IMPOSSIBLE = GConst.String.IMPOSSIBLE;
const NOT_BE_IN_LINE = GConst.String.NOT_BE_IN_LINE;

function _makeRound(num: number, f: number = 3): number {
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
  if (isMakeRound) {
    return {
      x: _makeRound(secondPoint.x - firstPoint.x),
      y: _makeRound(secondPoint.y - firstPoint.y),
    };
  }
  return {
    x: secondPoint.x - firstPoint.x,
    y: secondPoint.y - firstPoint.y,
  };
}

export function isVectorSameDirection(firstVector: CoordinateType, secondVector: CoordinateType): boolean {
  if (firstVector.x === 0) {
    return (
      secondVector.x === 0 && firstVector.y / Math.abs(firstVector.y) === secondVector.y / Math.abs(secondVector.y)
    );
  }

  if (firstVector.y === 0) {
    return (
      secondVector.y === 0 && firstVector.x / Math.abs(firstVector.x) === secondVector.x / Math.abs(secondVector.x)
    );
  }

  if (secondVector.x === 0) {
    return firstVector.x === 0 && firstVector.y / Math.abs(firstVector.y) === secondVector.y / Math.abs(secondVector.y);
  }

  if (secondVector.y === 0) {
    return firstVector.y === 0 && firstVector.x / Math.abs(firstVector.x) === secondVector.x / Math.abs(secondVector.x);
  }

  return (
    firstVector.x / Math.abs(firstVector.x) === secondVector.x / Math.abs(secondVector.x) &&
    firstVector.y / Math.abs(firstVector.y) === secondVector.y / Math.abs(secondVector.y) &&
    _makeRound(firstVector.x * secondVector.y) === _makeRound(firstVector.y * secondVector.x)
  );
}

export function isVectorInSameLine(firstVector: CoordinateType, secondVector: CoordinateType): boolean {
  if (firstVector.x === 0) {
    return secondVector.x === 0;
  }

  if (firstVector.y === 0) {
    return secondVector.y === 0;
  }

  if (secondVector.x === 0) {
    return firstVector.x === 0;
  }

  if (secondVector.y === 0) {
    return firstVector.y === 0;
  }

  return _makeRound(firstVector.x * secondVector.y) === _makeRound(firstVector.y * secondVector.x);
}

export function calculateMiddlePoint(firstPoint: CoordinateType, secondPoint: CoordinateType): CoordinateType {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
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
      x: 2 * secondPoint.x - firstPoint.x,
      y: 2 * secondPoint.y - firstPoint.y,
    }
    :
    {
      x: 2 * firstPoint.x - secondPoint.x,
      y: 2 * firstPoint.y - secondPoint.y,
    };
}

export function getLineFromTwoPoints(p1: CoordinateType, p2: CoordinateType): EquationType {
  const directionVector = {
    a: p2.x - p1.x,
    b: p2.y - p1.y,
  };
  const normalVector = {
    a: -directionVector.b,
    b: directionVector.a,
  };

  return {
    a: 0,
    b: 0,
    c: normalVector.a,
    d: normalVector.b,
    e: -normalVector.a * p1.x - normalVector.b * p1.y,
  };
}

export function calculateParallelEquation(equation: EquationType): EquationType {
  // Random a constance term from MIN_RANDOM_NUMBER -> MAX_RANDOM_NUMBER
  const e = Math.floor(Math.random() * 100) - MAX;

  let parallelEquation: EquationType = {coefficientZ: 0};
  parallelEquation.c = equation.c;
  parallelEquation.d = equation.d;
  parallelEquation.e = e;

  return parallelEquation;
}

export function calculatePerpendicularEquation(equation: EquationType): EquationType {
  // Random a constance term from MIN_RANDOM_NUMBER -> MAX_RANDOM_NUMBER
  const e = Math.floor(Math.random() * 100) - MIN;

  let perpendicularEquation: EquationType = {coefficientZ: 0};
  perpendicularEquation.c = -equation.c;
  perpendicularEquation.d = equation.d;
  perpendicularEquation.e = e;

  return perpendicularEquation;
}

export function calculateDistanceTwoPoints(firstPoint: CoordinateType, secondPoint: CoordinateType): number {
  const squareX = (secondPoint.x - firstPoint.x) * (secondPoint.x - firstPoint.x);
  const squareY = (secondPoint.y - firstPoint.y) * (secondPoint.y - firstPoint.y);

  return Math.sqrt(squareX + squareY);
}

export function calculateDistanceFromPointToLine(point: CoordinateType, line: EquationType): number {
  let numerator = Math.abs(line.c * point.x + line.d * point.y + line.e);
  let denominator = Math.sqrt(line.c * line.c + line.d * line.d);

  if (denominator === 0) {
    return INFINITY;
  }
  return numerator / denominator;
}

export function calculateParallelLineByPointAndLine(point: CoordinateType, line: EquationType): EquationType {
  // parallel line has `a` coefficient equals the other line.
  // parallel line's e = -ax - y with (x,y) is coordinate of the point
  const lineEquation = convertEquationToLineType(line);
  const parLine: LineType = {};
  parLine.a = lineEquation.a;
  parLine.b = point.y - lineEquation.a * point.x;

  let result = convertLineTypeToEquation(parLine);
  if (line.d === 0) {
    result.d = line.d;
  }
  return result;
}

export function calculatePerpendicularLineByPointAndLine(point: CoordinateType, line: EquationType): EquationType {
  let perpendicularLine: EquationType = {};

  // perpendicular line has the direction vector is opposite pairs with the other line.
  // perpendicular line's e = -ax - y with (x,y) is coordinate of the point
  if (line.c === 0) {
    perpendicularLine.c = -1 / line.d;
    perpendicularLine.d = 0;
    perpendicularLine.e = -perpendicularLine.c * point.x;
  }
  else if (line.d === 0) {
    perpendicularLine.c = 0;
    perpendicularLine.d = -1 / line.c;
    perpendicularLine.e = -perpendicularLine.d * point.y;
  }
  else {
    const lineEquation = convertEquationToLineType(line);
    const perLine: LineType = {};
    perLine.a = -1 / lineEquation.a;
    perLine.b = point.y + point.x / lineEquation.a;

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
  radius: number,
): TwoVariableQuadraticEquation {
  const roundedRadius = _makeRound(radius, 6);
  return {
    a: 1,
    b: 1,
    c: -2 * centerPoint.x,
    d: -2 * centerPoint.y,
    e: centerPoint.x * centerPoint.x + centerPoint.y * centerPoint.y - roundedRadius * roundedRadius,
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

  // const pointInFirstLine: CoordinateType = getRandomPointInLine(lineOne);
  // let pointInSecondLine: CoordinateType = { x: pointInFirstLine.x, y: undefined };
  // if (lineTwo.d !== 0) {
  //   pointInSecondLine.y = (-lineTwo.e - lineTwo.c * pointInSecondLine.x) / lineTwo.d;
  // } else {
  //   pointInSecondLine.y = getRandomValue(MIN_RANDOM_NUMBER, MAX_RANDOM_NUMBER);
  // }

  if (getAngleFromTwoLines(lineOne, lineTwo) === 0) {
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

  if (getAngleFromTwoLines(lineOne, lineTwo) === 0) {
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
  if (lineTwo.c * lineTwo.c + lineTwo.d * lineTwo.d === 0) {
    return;
  }

  // Represent for [sqrt(a*a + b*b) / sqrt(a'*a' + b'*b')]
  let coefficient =
    Math.sqrt(lineOne.c * lineOne.c + lineOne.d * lineOne.d) / Math.sqrt(lineTwo.c * lineTwo.c + lineTwo.d * lineTwo.d);

  /*
   * Two results:
   *    (a - coefficient*a')x + (b - coefficient*b')y + c - coefficient*c' = 0
   *    (a + coefficient*a')x + (b + coefficient*b')y + c + coefficient*c' = 0
   */
  resultOne.c = lineOne.c - coefficient * lineTwo.c;
  resultOne.d = lineOne.d - coefficient * lineTwo.d;
  resultOne.e = lineOne.e - coefficient * lineTwo.e;

  resultTwo.c = lineOne.c + coefficient * lineTwo.c;
  resultTwo.d = lineOne.d + coefficient * lineTwo.d;
  resultTwo.e = lineOne.e + coefficient * lineTwo.e;

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
  let firstEquation = pointOne.x * lineOne.c + pointOne.y * lineOne.d + lineOne.e;
  let secondEquation = pointTwo.x * lineOne.c + pointTwo.y * lineOne.d + lineOne.e;
  return firstEquation * secondEquation <= 0 ?
    lineOne :
    lineTwo;
}

// TODO: Uncheck
export function calculateSetOfEquationTypes(d1: EquationType, d2: EquationType) {
  if (
    (d1.c === 0 && d2.c === 0) ||
    (d1.d === 0 && d2.d === 0) ||
    (d1.c === 0 && d1.d === 0) ||
    (d2.c === 0 && d2.d === 0)
  ) {
    return IMPOSSIBLE;
  }
  if (d1.c === 0 && d2.d === 0) {
    return {
      x: -d2.e / d2.c,
      y: -d1.e / d1.d,
    };
  }
  if (d2.c === 0 && d1.d === 0) {
    return {
      x: -d1.e / d1.c,
      y: -d2.e / d2.d,
    };
  }
  if (d1.e === 0 && d2.e === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  if (d1.c === 0) {
    const tempY = -d1.e / d1.d;
    return {
      x: (-d2.e - tempY * d2.d) / d2.c,
      y: tempY,
    };
  }

  if (d1.d === 0) {
    const tempX = -d1.e / d1.c;
    return {
      x: tempX,
      y: (-d2.e - tempX * d2.c) / d2.d,
    };
  }

  if (d2.c === 0) {
    const tempY = -d2.e / d2.d;
    return {
      x: (-d1.e - tempY * d1.d) / d1.c,
      y: tempY,
    };
  }

  if (d2.d === 0) {
    const tempX = -d2.e / d2.c;
    return {
      x: tempX,
      y: (-d1.e - tempX * d1.c) / d1.d,
    };
  }
  const tempY = (d1.e * d2.c - d1.c * d2.e) / (d1.d * d2.c - d1.c * d2.d);
  return {
    x: (-d1.e - d1.d * tempY) / d1.c,
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
export function calculateIntersectionEquationTypeWithCircleEquation(d: EquationType, q: EquationType): Array<Object> {
  const A = -q.c / 2;
  const B = -q.d / 2;
  const centerPoint: CoordinateType = {
    x: A,
    y: B,
  };
  const distanceFromCenterPointToLine = calculateDistanceFromPointToLine(centerPoint, d);

  if (distanceFromCenterPointToLine > Math.sqrt(A * A + B * B - q.e)) {
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
export function calculateQuadraticEquation(a: number, b: number, c: number) {
  const delta = b * b - 4 * a * c;

  let firstRoot,
    secondRoot: number = undefined;

  if (a === 0) {
    if (b === 0) {
      return [];
    }
    return [-c / b];
  }
  else if (delta < 0) {
    return [];
  }
  else if (delta === 0) {
    return [-b / (2 * a)];
  }
  else {
    firstRoot = (-b + Math.sqrt(delta)) / (2 * a);
    secondRoot = (-b - Math.sqrt(delta)) / (2 * a);
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
  const temp = e.a * p.x * p.x + e.b * p.y * p.y + e.c * p.x + e.d * p.y + e.e;
  return _makeRound(temp) === 0;
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
    u = A * A * E + D * B * B;
    v = 2 * B * C * D - A * B * F + A * A * G;
    w = D * C * C - A * C * F + A * A * H;

    // solves x. Unneeded check IMPOSSIBLE.
    const root = calculateQuadraticEquation(u, v, w);
    if (Array.isArray(root) && root.length === 1) {
      results.push({
        x: (-C - B * root[0]) / A,
        y: root[0],
      });
    }
    else if (Array.isArray(root) && root.length === 0) {
      return [];
    }
    else {
      const r1 = root[0];
      const r2 = root[1];
      results.push({
        x: (-C - B * root[0]) / A,
        y: r1,
      }, {
        x: (-C - B * root[1]) / A,
        y: r2,
      });
    }
  }
  else {
    u = q.a * l.d * l.d;
    v = q.c * l.d * l.d;
    w = q.b * l.e * l.e - q.d * l.d * l.e + q.e * l.d * l.d;

    // solves x. Unneeded check IMPOSSIBLE.
    const root = calculateQuadraticEquation(u, v, w);

    if (Array.isArray(root) && root.length === 1) {
      results.push({
        x: root[0],
        y: -l.e / l.d,
      });
    }
    else if (Array.isArray(root) && root.length === 0) {
      return [];
    }
    else {
      results.push({
        x: root[0],
        y: -l.e / l.d,
      }, {
        x: root[1],
        y: -l.e / l.d,
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

  if (q1.a !== q2.a && q1.b !== q2.b) {
    if (q1.a === 0 && q1.b === 0) {
      // q2 is a quadratic equation
      return calculateIntersectionEquationTypeWithCircleEquation(q1, q2);
    }
    else {
      // q1 is a quadratic equation
      return calculateIntersectionEquationTypeWithCircleEquation(q2, q1);
    }
  }
  else if (q1.a === 0 && q1.b === 0 && q2.a === 0 && q2.b === 0) {
    results.push(calculateSetOfEquationTypes(q1, q2));
  }
  else {
    // a x2 + b y2 + Ax + By + C = 0
    // a'x2 + b'y2 + Dx + Ey + G = 0
    const D = q2.c;
    const E = q2.d;
    const G = q2.e;

    // Z = a - a'
    const Z = q1.a - q2.a > 0 ?
      q1.a :
      q2.a;
    const _D = Z === q1.a ?
      q1.c :
      D;
    const _E = Z === q1.a ?
      q1.d :
      E;
    const _G = Z === q1.a ?
      q1.e :
      G;

    const a = Z === q1.a ?
      q1.c - D :
      D - q1.c;
    const b = Z === q1.a ?
      q1.d - E :
      E - q1.d;
    const c = Z === q1.a ?
      q1.e - G :
      G - q1.e;

    if (a === 0 || b === 0) {
      return IMPOSSIBLE;
    }
    else {
      const u = Z * (b * b + a * a);
      const v = 2 * b * c * Z - _D * a * b + _E * a * a;
      const w = Z * c * c - _D * a * c + _G * a * a;

      const roots = calculateQuadraticEquation(u, v, w);
      if (roots === IMPOSSIBLE) {
        return roots;
      }
      else if (typeof roots === 'number') {
        results.push({
          x: (-c - b * roots) / a,
          y: roots,
        });
      }
      else {
        const r1 = roots.firstRoot;
        const r2 = roots.secondRoot;
        results.push({
          x: (-c - b * roots.firstRoot) / a,
          y: r1,
        }, {
          x: (-c - b * roots.secondRoot) / a,
          y: r2,
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
  return vectorOne.x * vectorTwo.x + vectorOne.y * vectorTwo.y;
}

function calculateVectorLength(vector: CoordinateType): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export function calculateAngleTwoVector(vectorOne: CoordinateType, vectorTwo: CoordinateType): number {
  return _makeRound(
    (Math.acos(
      calculateIntegratedDirection(vectorOne, vectorTwo) /
      (calculateVectorLength(vectorOne) * calculateVectorLength(vectorTwo)),
      ) *
      180) /
    Math.PI,
    1,
  );
}

export function _calculateLinesByAnotherLineAndAngle(d: EquationType, p: CoordinateType, angle: number) {
  let results: Array<EquationType> = [];

  const cosine = Math.cos((angle * Math.PI) / 180);
  const A = d.c * d.c - cosine * cosine * d.c * d.c - cosine * cosine * d.d * d.d;
  const B = 2 * d.c * d.d;
  const C = d.d * d.d - cosine * cosine * d.c * d.c - cosine * cosine * d.d * d.d;
  const root = calculateQuadraticEquation(A, B, C);

  if (typeof root === 'number') {
    results.push({
      c: root,
      d: 1,
      e: -root * p.x - p.y,
    });
  }
  else if (root === IMPOSSIBLE) {
    return root;
  }
  else {
    results.push(
      {
        c: root.firstRoot,
        d: 1,
        e: -root.firstRoot * p.x - p.y,
      },
      {
        c: root.secondRoot,
        d: 1,
        e: -root.secondRoot * p.x - p.y,
      },
    );
  }

  return results;
}

export function makeRoundCoordinate(point: CoordinateType, f: number = 3) {
  if (typeof point === 'string') {
    return point;
  }
  return {
    x: _makeRound(point.x, f),
    y: _makeRound(point.y, f),
  };
}

export function getAngleFromTwoLines(d1: EquationType, d2: EquationType): number {
  if (
    d1.a ||
    d1.b ||
    d2.a ||
    d2.b ||
    (d1.c === 0 && d1.d === 0 && d1.e === 0) ||
    (d2.c === 0 && d2.d === 0 && d2.e === 0)
  ) {
    return -9999;
  }


  const a1 = d1.c;
  const a2 = d2.c;
  const b1 = d1.d;
  const b2 = d2.d;

  const result =
    (Math.acos(Math.abs(a1 * a2 + b1 * b2) / Math.sqrt((a1 * a1 + b1 * b1) * (a2 * a2 + b2 * b2))) * 180) / Math.PI;

  // round result
  return _makeRound(result, 1);
}

export function getMiddlePointFromThreePointsInALine(
  p1: CoordinateType,
  p2: CoordinateType,
  p3: CoordinateType,
): CoordinateType {
  const line = getLineFromTwoPoints(p1, p2);
  if (!isIn(p3, {
    a: 0,
    b: 0,
    c: line.c,
    d: line.d,
    e: line.e,
  })) {
    return NOT_BE_IN_LINE;
  }

  // another way: check vector =)))~
  const dis_p1_p2 = calculateDistanceTwoPoints(p1, p2);
  const dis_p2_p3 = calculateDistanceTwoPoints(p2, p3);
  const dis_p1_p3 = calculateDistanceTwoPoints(p1, p3);

  const max = Math.max(dis_p1_p2, dis_p2_p3, dis_p1_p3);
  if (dis_p1_p2 === max) {
    return p3;
  }
  else if (dis_p1_p3 === max) {
    return p2;
  }
  else {
    return p1;
  }
}

export function calculateCircumCircleEquation(p1: CoordinateType, p2: CoordinateType, p3: CoordinateType): CircleType {
  const midperpendicularsLineOne = calculatePerpendicularLineByPointAndLine(
    calculateMiddlePoint(p1, p2),
    getLineFromTwoPoints(p1, p2),
  );

  const midperpendicularsLineTwo = calculatePerpendicularLineByPointAndLine(
    calculateMiddlePoint(p1, p3),
    getLineFromTwoPoints(p1, p3),
  );

  const center = calculateIntersectionByLineAndLine(midperpendicularsLineOne, midperpendicularsLineTwo);
  const radius = calculateDistanceTwoPoints(center, p1);

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

  tangentEquation.a = 0;
  tangentEquation.b = 0;
  tangentEquation.c = tangentPoint.x + circle.c / 2;
  tangentEquation.d = tangentPoint.y + circle.d / 2;
  tangentEquation.e = circle.e + (circle.c * tangentPoint.x) / 2 + (circle.d * tangentPoint.y) / 2;

  return tangentEquation;
}

export function calculateTangentIntersectPointsByPointOutsideCircle(
  circle: EquationType,
  point?: CoordinateType = null,
  exceptionPoint?: CoordinateType = null,
): EquationType {
  const center: CoordinateType = {
    x: -circle.c / 2,
    y: -circle.d / 2,
  };

  const tempCircleCenter = calculateMiddlePoint(center, point);
  const tempCircleRadius = calculateDistanceTwoPoints(center, point) / 2;

  const tempCircleEquation = calculateCircleEquationByCenterPoint(tempCircleCenter, tempCircleRadius);

  let roots = calculateIntersectionTwoCircleEquations(circle, tempCircleEquation);

  if (exceptionPoint) {
    roots = roots.filter((root: CoordinateType): boolean => JSON.stringify(root) !== JSON.stringify(exceptionPoint));
  }

  return roots;
}

export function isTwoEquationEqual(equationOne: EquationType, equationTwo: EquationType): boolean {
  return getAngleFromTwoLines(equationOne, equationTwo, 1) === 0;
}

export function isIsosceles(p1: CoordinateType, p2: CoordinateType, p3: CoordinateType): boolean {
  let result = false;
  if (distance(p1, p2) === distance(p1, p3)) {
    result = true;
  }
  else if (distance(p2, p1) === distance(p2, p3)) {
    result = true;
  }
  else if (distance(p3, p2) === distance(p3, p1)) {
    result = true;
  }
  return result;
}

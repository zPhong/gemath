import type {
  CoordinateType,
  EquationType,
  LineType,
} from '../../utils/types';

export function convertLinearToEquation(l: EquationType): EquationType {
  return {
    a: 0,
    b: 0,
    c: l.c,
    d: l.d,
    e: l.e,
  };
}

export function convertEquationToLineType(line: EquationType): LineType {
  return {
    a: -line.c /
      (line.d === 0 ?
        1 :
        line.d),

    b: -line.e /
      (line.d === 0 ?
        1 :
        line.d),
  };
}

export function convertLineTypeToEquation(line: LineType): EquationType {
  return {
    a: 0,
    b: 0,
    c: -line.a,
    d: 1,
    e: -line.b,
  };
}

export function convertCircleEquation(centerPoint: CoordinateType, radius: number): EquationType {
  let results = undefined;

  if (radius < 0) {
    results = 'Radius must be a positive number';
  }

  const cX = centerPoint.x;
  const cY = centerPoint.y;

  const cXSquare = cX * cX;
  const cYSquare = cY * cY;
  const rSquare = radius * radius;

  results = {
    a: 1,
    b: 1,
    c: -2 * cX,
    d: -2 * cY,
    e: cXSquare + cYSquare - rSquare,
  };

  return results;
}


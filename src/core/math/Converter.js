import type { EquationType, LineType } from '../../utils/types';

export function convertLinearToEquation(l: EquationType): EquationType {
  return {
    a: 0,
    b: 0,
    c: l.c,
    d: l.d,
    e: l.e
  };
}

export function convertEquationToLineType(line: EquationType): LineType {
  return {
    a: -line.c / (line.d === 0 ? 1 : line.d),
    b: -line.e / (line.d === 0 ? 1 : line.d)
  };
}

export function convertLineTypeToEquation(line: LineType): EquationType {
  return {
    a: 0,
    b: 0,
    c: -line.a,
    d: 1,
    e: -line.b
  };
}


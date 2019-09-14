import type {
  EquationType,
  LineType,
} from '../../utils/types';
import { isValid } from '../utils/index';

export function convertLinearToEquation(l: EquationType): EquationType {
  if (
    isValid(l) &&
    isValid(l.c) &&
    isValid(l.d) &&
    isValid(l.e)
  ) {
    return {
      a: 0,
      b: 0,
      c: l.c,
      d: l.d,
      e: l.e,
    };
  }
}

export function convertEquationToLineType(line: EquationType): LineType {
  if (
    isValid(line) &&
    isValid(line.c) &&
    isValid(line.d) &&
    isValid(line.e)
  ) {
    return {
      a: -line.c / (line.d === 0 ?
        1 :
        line.d),
      b: -line.e / (line.d === 0 ?
        1 :
        line.d),
    };
  }
}

export function convertLineTypeToEquation(line: LineType): EquationType {
  if (
    isValid(line) &&
    isValid(line.a) &&
    isValid(line.b)
  ) {
    return {
      a: 0,
      b: 0,
      c: -line.a,
      d: 1,
      e: -line.b,
    };
  }
}


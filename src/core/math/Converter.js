import type {
  EquationType,
  LineType,
} from '../../utils/types';
import { isValid } from '../utils/index';
import { Operation } from './MathOperation';

const {Sub, Divide, isZero} = Operation;

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
      //-line.c / (line.d === 0 ? 1 : line.d)
      a: Divide(Sub(0, line.c), isZero(line.d) ?
        1 :
        line.d),
      b: Divide(Sub(0, line.e), isZero(line.d) ?
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
      c: Sub(0, line.a),
      d: 1,
      e: Sub(0, line.b),
    };
  }
}

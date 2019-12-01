//@flow

import { evaluate } from 'mathjs';
import type { CalculatedResultType } from '../../utils/types';

import ErrorService from '../error/ErrorHandleService';

function MathOperation(): Object {
  function Parenthesis(element: CalculatedResultType): string {
    if (!isNaN(element)) {
      return element;
    }
    if (typeof element === 'string') {
      return `(${element})`;
    }
    ErrorService.showError('200');
  }
  function Add(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) || !isNaN(elementTwo)) {
      if (parseFloat(elementOne) === 0) {
        return Parenthesis(elementTwo);
      }
      if (parseFloat(elementTwo) === 0) {
        return Parenthesis(elementOne);
      }
    }

    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      if (parseFloat(elementOne) === Round(elementOne) && parseFloat(elementTwo) === Round(elementTwo))
        return parseFloat(elementOne) + parseFloat(elementTwo);
    }

    const result = `(${elementOne})+(${elementTwo})`;

    return Parenthesis(result);
  }
  function Sub(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      if (parseFloat(elementOne) === 0) {
        if (parseFloat(elementTwo) < 0) {
          return Math.abs(parseFloat(elementTwo));
        }
        return `-${elementTwo}`;
      }
      if (parseFloat(elementTwo) === 0) {
        return elementOne;
      }
      return parseFloat(elementOne) - parseFloat(elementTwo);
    }
    const result = `(${elementOne})-(${elementTwo})`;
    return Parenthesis(result);
  }
  function Multiply(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) || !isNaN(elementTwo)) {
      if (parseFloat(elementOne) === 0 || parseFloat(elementTwo) === 0) {
        return 0;
      }
      if (!isNaN(elementOne) && Math.abs(elementOne) === 1) {
        const calculatedValue = evaluate(elementTwo);
        if (calculatedValue === Round(calculatedValue)) {
          return Parenthesis(parseFloat(elementOne) * calculatedValue);
        }
        const isNegative = parseFloat(elementOne) / Math.abs(elementOne) < 0;
        return Parenthesis(`${isNegative ? '-' : ''}(${elementTwo})`);
      }
      if (!isNaN(elementTwo) && Math.abs(elementTwo) === 1) {
        const calculatedValue = evaluate(elementOne);
        if (calculatedValue === Round(calculatedValue)) {
          return Parenthesis(parseFloat(elementTwo) * calculatedValue);
        }
        const isNegative = parseFloat(elementTwo) / Math.abs(elementTwo) < 0;
        return Parenthesis(`${isNegative ? '-' : ''}(${elementOne})`);
      }
    }

    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      return parseFloat(elementOne) * parseFloat(elementTwo);
    }

    const result = `(${elementOne})*(${elementTwo})`;

    const calculatedValue = evaluate(result);
    if (calculatedValue === Round(calculatedValue)) {
      return Parenthesis(calculatedValue);
    }
    return Parenthesis(result);
  }
  function Divide(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) || !isNaN(elementTwo)) {
      if (parseFloat(elementOne) === 0) {
        return 0;
      }
      if (parseFloat(elementTwo) === 0) {
        ErrorService.showError('200');
      }
      if (!isNaN(elementTwo) && Math.abs(elementTwo) === 1) {
        const calculatedValue = evaluate(elementOne);
        if (calculatedValue === Round(calculatedValue)) {
          return Parenthesis(parseFloat(elementTwo) * calculatedValue);
        }
        const isNegative = parseFloat(elementTwo) / Math.abs(elementTwo) < 0;
        return Parenthesis(`${isNegative ? '-' : ''}(${elementOne})`);
      }
    }

    const result = `(${elementOne})/(${elementTwo})`;

    const calculatedValue = evaluate(result);
    if (calculatedValue === Round(calculatedValue)) {
      return Parenthesis(calculatedValue);
    }
    return Parenthesis(result);
  }
  function Sqrt(element: CalculatedResultType): CalculatedResultType {
    const result = `(${element})^(1/2)`;
    if (Round(element) < 0) {
      ErrorService.showError('200');
    }
    const calculatedValue = evaluate(result);
    if (typeof calculatedValue !== 'number') {
      if (Round(element, 8) === 0) {
        return 0;
      }
      ErrorService.showError('200');
    }
    if (calculatedValue === Round(calculatedValue)) {
      return calculatedValue;
    }
    return Parenthesis(result);
  }
  function Pow(element: CalculatedResultType, exponent: CalculatedResultType): CalculatedResultType {
    if (!isNaN(element)) {
      return parseFloat(element) * parseFloat(element);
    }
    const result = `(${element})^(${exponent})`;

    const calculatedValue = evaluate(result);

    if (calculatedValue === Round(calculatedValue)) {
      return Parenthesis(calculatedValue);
    }
    return Parenthesis(result);
  }

  function isEqual(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): boolean {
    const calculatedValueOne = Round(elementOne, 7);
    const calculatedValueTwo = Round(elementTwo, 7);

    return calculatedValueOne === calculatedValueTwo;
  }

  function Compare(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): number {
    const calculatedValueOne = Round(elementOne, 3);
    const calculatedValueTwo = Round(elementTwo, 3);

    if (calculatedValueOne > calculatedValueTwo) {
      return 1;
    }
    if (calculatedValueOne < calculatedValueTwo) {
      return -1;
    }
    return 0;
  }
  function isZero(element: CalculatedResultType): boolean {
    return Round(element, 5) === 0;
  }

  function isSmallerThanZero(element: CalculatedResultType): boolean {
    return Round(element, 5) < 0;
  }

  function Abs(element: CalculatedResultType): CalculatedResultType {
    const calculatedValue = evaluate(element);

    if (calculatedValue >= 0) {
      return element;
    }

    return Parenthesis(Sub(0, element));
  }

  function Round(element: CalculatedResultType, f?: number = 3): number {
    const calculatedValue = typeof element === 'number' ? element : evaluate(element);
    const myF = Math.pow(10, f);
    return Math.round(calculatedValue * myF) / myF;
  }

  function Max(...values: Array<CalculatedResultType>): CalculatedResultType {
    let max = values[0];
    let maxValue = evaluate(max);
    values.forEach((value: CalculatedResultType) => {
      const evaluatedValue = evaluate(value);
      if (evaluatedValue > maxValue) {
        maxValue = evaluatedValue;
        max = value;
      }
    });

    return max;
  }

  return Object.freeze({
    Parenthesis,
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
    Max
  });
}

const instance = MathOperation();

export { instance as Operation };

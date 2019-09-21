//@flow

import { evaluate } from 'mathjs';
import type { CalculatedResultType } from '../../utils/types';

function MathOperation(): Object {
  function Parenthesis(element: CalculatedResultType): string {
    return `(${element})`;
  }
  function Add(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (elementOne === 0) {
      return elementTwo;
    }
    if (elementTwo === 0) {
      return elementOne;
    }

    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      return parseFloat(elementOne) + parseFloat(elementTwo);
    }

    const result = `${elementOne}+${elementTwo}`;
    // const calculatedValue = evaluate(result);

    // if (calculatedValue === Round(calculatedValue)) {
    //   return Parenthesis(calculatedValue);
    // }
    return Parenthesis(result);
  }
  function Sub(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (elementOne === 0) {
      if (parseFloat(elementTwo) < 0) {
        return Math.abs(parseFloat(elementTwo));
      }
      return `-${elementTwo}`;
    }
    if (elementTwo === 0) {
      return elementOne;
    }

    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      return parseFloat(elementOne) - parseFloat(elementTwo);
    }
    const result = `${elementOne}-${elementTwo}`;

    // const calculatedValue = evaluate(result);

    // if (calculatedValue === Round(calculatedValue)) {
    //   return Parenthesis(calculatedValue);
    // }
    return Parenthesis(result);
  }
  function Multiply(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) || !isNaN(elementTwo)) {
      if (elementOne === 0 || elementTwo === 0) {
        return 0;
      }
      if (!isNaN(elementOne) && Math.abs(elementOne) === 1) {
        return (parseFloat(elementOne) / Math.abs(elementOne)) * parseFloat(elementOne);
      }
      if (!isNaN(elementTwo) && Math.abs(elementTwo) === 1) {
        return (parseFloat(elementTwo) / Math.abs(elementTwo)) * parseFloat(elementTwo);
      }
    }

    if (!isNaN(elementOne) && !isNaN(elementTwo)) {
      return parseFloat(elementOne) * parseFloat(elementTwo);
    }

    const result = `${elementOne}*${elementTwo}`;
    // const calculatedValue = evaluate(result);

    // if (calculatedValue === Round(calculatedValue)) {
    //   return Parenthesis(calculatedValue);
    // }
    return Parenthesis(result);
  }
  function Divide(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): CalculatedResultType {
    if (!isNaN(elementOne) || !isNaN(elementTwo)) {
      if (elementOne === 0) {
        return 0;
      }
      if (!isNaN(elementTwo) && Math.abs(elementTwo) === 1) {
        return (parseFloat(elementTwo) / Math.abs(elementTwo)) * parseFloat(elementOne);
      }
    }

    const result = `${elementOne}/${elementTwo}`;

    const calculatedValue = evaluate(result);
    if (calculatedValue === Round(calculatedValue)) {
      return Parenthesis(calculatedValue);
    }
    return Parenthesis(result);
  }
  function Sqrt(element: CalculatedResultType): CalculatedResultType {
    const result = `${element}^(1/2)`;

    const calculatedValue = evaluate(result);

    if (calculatedValue === Round(calculatedValue)) {
      return calculatedValue;
    }
    return result;
  }
  function Pow(element: CalculatedResultType, exponent: CalculatedResultType): CalculatedResultType {
    if (!isNaN(element)) {
      return parseFloat(element) * parseFloat(element);
    }
    const result = `${element}^${exponent}`;

    // const calculatedValue = evaluate(result);

    // if (calculatedValue === Round(calculatedValue)) {
    //   return Parenthesis(calculatedValue);
    // }
    return result;
  }

  function isEqual(elementOne: CalculatedResultType, elementTwo: CalculatedResultType): boolean {
    const calculatedValueOne = evaluate(elementOne);
    const calculatedValueTwo = evaluate(elementTwo);

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
    return evaluate(element) === 0;
  }

  function isSmallerThanZero(element: CalculatedResultType): boolean {
    return evaluate(element) < 0;
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

// @flow

import GConst from '../config/values';
import type {
  CoordinateType,
  EquationType,
} from '../../utils/types';
import {
  calculatePerpendicularLineByPointAndLine,
  calculateQuadraticEquation,
  getLineFromTwoPoints,
} from './Math2D';
import {
  isNum,
  isValid,
} from '../utils';

const MIN = GConst.Number.MIN_RANDOM_NUMBER;
const MAX = GConst.Number.MAX_RANDOM_NUMBER;

export function getStartPoint(): CoordinateType {
  return {
    x: 0,
    y: 0,
  };
}

export function getRandomValue(min: number, max: number): number {
  if (isNum(min) && isNum(max)) {
    if (max < min) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export function getRandomPointInEquation(equation: EquationType): CoordinateType {
  if (
    isValid(equation) &&
    isValid(equation.a) &&
    isValid(equation.b) &&
    isValid(equation.c) &&
    isValid(equation.d) &&
    isValid(equation.e)
  ) {
    if (!equation.a) {
      equation.a = 0;
    }
    if (!equation.b) {
      equation.b = 0;
    }
    if (equation.a === 0 && equation.b === 0) {
      if (equation.d !== 0) {
        const tempX = getRandomValue(MIN, MAX);
        return {
          x: tempX,
          y: (-equation.e - equation.c * tempX) / equation.d,
        };
      }
      else {
        return {
          x: -equation.e / equation.c,
          y: getRandomValue(MIN, MAX),
        };
      }
    }
    else if (equation.a === 1 && equation.b === 1) {
      const centerPoint = {
        a: equation.c / -2,
        b: equation.d / -2,
      };

      const radius = Math.sqrt(centerPoint.a * centerPoint.a + centerPoint.b * centerPoint.b - equation.e);

      const randomValueX = getRandomValue(centerPoint.a - radius, centerPoint.a + radius);

      let solvedValueY = undefined;
      if (isValid(randomValueX)) {
        solvedValueY = calculateQuadraticEquation(
          equation.b,
          equation.d,
          randomValueX * randomValueX + equation.c * randomValueX + equation.e,
        );
      }

      if (typeof solvedValueY === 'number') {
        return {
          x: randomValueX,
          y: solvedValueY,
        };
      }
      else if (typeof solvedValueY === 'object') {
        return {
          x: randomValueX,
          y: solvedValueY.secondRoot || solvedValueY.firstRoot,
        };
      }
    }
  }
}

export function generatePointAlignmentInside(firstPoint: CoordinateType, secondPoint: CoordinateType): CoordinateType {
  if (
    isValid(firstPoint) &&
    isValid(firstPoint.x) &&
    isValid(secondPoint) &&
    isValid(secondPoint.x)
  ) {
    const line = getLineFromTwoPoints(firstPoint, secondPoint);
    const tempX = (firstPoint.x + secondPoint.x) / getRandomValue(2, 5);

    if (
      isValid(line) &&
      isValid(line.c) &&
      isValid(line.d) &&
      isValid(line.e) &&
      isValid(tempX)
    ) {
      return {
        x: tempX,
        y: (line.c * tempX + line.e) / -line.d,
      };
    }
  }
}

export function generatePointAlignmentOutside(
  firstPoint: CoordinateType,
  secondPoint: CoordinateType,
  isRight: boolean = true,
): CoordinateType {
  if (
    isValid(firstPoint) &&
    isValid(firstPoint.x) &&
    isValid(secondPoint) &&
    isValid(secondPoint.x)
  ) {
    const line = getLineFromTwoPoints(firstPoint, secondPoint);
    const tempXRight = getRandomValue(secondPoint.x, MAX);
    const tempXLeft = getRandomValue(MIN, firstPoint.x);

    if (
      isValid(line) &&
      isValid(line.c) &&
      isValid(line.d) &&
      isValid(line.e) &&
      isValid(tempXLeft) &&
      isValid(tempXRight)
    ) {
      return isRight ?
        {
          x: tempXRight,
          y: (line.c * tempXRight + line.e) / -line.d,
        }
        :
        {
          x: tempXLeft,
          y: (line.c * tempXLeft + line.e) / -line.d,
        };
    }
  }
}

export function generatePointNotAlignment(firstPoint: CoordinateType, secondPoint: CoordinateType): CoordinateType {
  if (isValid(firstPoint) && isValid(secondPoint)) {
    let resultPoint: CoordinateType = {};
    resultPoint.x = getRandomValue(MIN, MAX);
    const line = getLineFromTwoPoints(firstPoint, secondPoint);
    if (isValid(line) && isValid(line.c) && isValid(line.e)) {
      do {
        resultPoint.y = getRandomValue(MIN, MAX);
      }
      while (resultPoint.y === line.c * resultPoint.x + line.e);
    }
    return resultPoint;
  }
}

export function generatePointMiddleTwoPoints(p1: CoordinateType, p2: CoordinateType) {
  if (isValid(p1) && isValid(p2)) {
    const line = getLineFromTwoPoints(p1, p2);
    const randomPoint = generatePointAlignmentInside(p1, p2);

    const randomLine = calculatePerpendicularLineByPointAndLine(randomPoint, line);
    return getRandomPointInEquation(randomLine);
  }
}

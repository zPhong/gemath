import dataViewModel from '../../ViewModel/DataViewModel';
import type {
  CoordinateType,
  NodeType,
} from '../../utils/types';
import {
  calculateDistanceTwoPoints,
  calculateIntersectionByLineAndLine,
  getLineFromTwoPoints,
  isIn,
  isIsosceles,
} from './Math2D';
import { getRandomValue } from './Generation.js';
import GConst from '../config/values';
import {
  isFunc,
  isValid,
} from '../utils';

const MIN = GConst.Number.MIN_RANDOM_GENERATION;
const MAX = GConst.Number.MAX_RANDOM_GENERATION;

const geometricObj = {
  triangle: generateTriangle,
  quadrilateral: generateQuadrilateral,
  trapezoid: generateTrapezoid,
  parallelogram: generateParallelogram,
  rectangle: generateRectangle,
  rhombus: generateRhombus,
  square: generateSquare,
  circle: generateCircle,
};

export function generateGeometry(name: string, shape: string, type?: string) {
  const generateFunc = geometricObj[shape];
  if (generateFunc) {
    generateFunc(name, type);
  }
}

function updateCoordinate(node: NodeType, point: CoordinateType) {
  if (
    isValid(node) &&
    isValid(point) &&
    dataViewModel &&
    isFunc(dataViewModel.updateCoordinate)
  ) {
    dataViewModel.updateCoordinate(node, point);
  }
}

function generateTriangle(name: string, type: string) {
  if (isValid(name) && name.length === 3) {
    let p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    let p2: CoordinateType = {};
    let p3: CoordinateType = {};

    updateCoordinate(name[0], p1);
    switch (type) {
      case '': {
        p3.x = getRandomValue(p1.x - MIN, p1.x + MAX);
        p3.y = getRandomValue(p1.y - MIN, p1.y + MAX);
        updateCoordinate(name[1], p3);
        p2.x = getRandomValue(p1.x - MIN, p1.x + MAX);
        p2.y = getRandomValue(p1.y - MIN, p1.y + MAX);
        while (isIn(p2, getLineFromTwoPoints(p1, p3)) || isIsosceles(p1, p2, p3)) {
          p2.x = getRandomValue(p1.x - MIN, p1.x + MAX);
          p2.y = getRandomValue(p1.y - MIN, p1.y + MAX);
        }
        updateCoordinate(name[2], p2);
        break;
      }

      case 'vuông': {
        p2.y = getRandomValue(p1.y + MIN, p1.y + MAX);
        p2.x = p1.x;
        updateCoordinate(name[2], p2);
        p3.x = getRandomValue(p1.x + 1, p1.x + 50);
        p3.y = p1.y;
        updateCoordinate(name[1], p3);
        break;
      }

      case 'cân': {
        /*
         *            [A]
         *          *    *
         *        *        *
         *      *            *
         *    *                *
         *  B  * * * * * * * *  C
         */
        const distance_From_A_To_B = getRandomValue(3, 6);

        p3.y = getRandomValue(p1.y + 5, p1.y + 10);
        p3.x = p1.x - distance_From_A_To_B;
        updateCoordinate(name[1], p3);
        p2.y = p3.y;
        p2.x = p1.x + distance_From_A_To_B;
        updateCoordinate(name[2], p2);
        break;
      }

      case 'vuông cân': {
        const distance_From_A_To_B = getRandomValue(5, 10);
        p3.y = p1.y + distance_From_A_To_B;
        p3.x = p1.x - distance_From_A_To_B;
        updateCoordinate(name[1], p3);
        p2.y = p3.y;
        p2.x = p1.x + distance_From_A_To_B;
        updateCoordinate(name[2], p2);
        break;
      }

      case 'đều': {
        /*
         *       [A]
         *      *   *
         *    *       *
         * [B] * * * * [C]
         */
        p2.x = getRandomValue(p1.x + MIN, p1.x + MAX);
        p2.y = Math.sqrt(3) * p2.x;
        updateCoordinate(name[2], p2);
        const distance_From_A_To_B = calculateDistanceTwoPoints(p1, p2);
        p3.y = p2.y;
        p3.x = -distance_From_A_To_B + p2.x;
        updateCoordinate(name[1], p3);
        break;
      }

      default: {
        break;
      }
    }
  }
}

// Tu giac
function generateQuadrilateral(name: string) {
  if (isValid(name) && name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    // p2 represents point B
    const p2: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: getRandomValue(p1.y - MAX, p1.y + MAX),
    };
    updateCoordinate(name[1], p2);

    // p3 represents point C
    let p3: CoordinateType = {};
    // prevent point C is on AB line
    const linearEquation = getLineFromTwoPoints(p1, p2);
    if (
      isValid(linearEquation) &&
      isValid(linearEquation.c) &&
      isValid(linearEquation.e)
    ) {
      do {
        p3.x = getRandomValue(p1.x + MIN, p1.x + MAX);
        p3.y = getRandomValue(p2.y + MIN, p2.y + MAX); // yC is always greater than yB
      }
      while (isIn(p3, linearEquation) || Math.abs(p3.y - p2.y) < 5);
      updateCoordinate(name[2], p3);
    }

    // p4 represents point D
    const p4: CoordinateType = {
      x: undefined,
      y: undefined,
    };

    // prevents p1, p2, p4 are straight
    const lineAB = getLineFromTwoPoints(p1, p2);
    const lineAC = getLineFromTwoPoints(p1, p3);
    const lineBC = getLineFromTwoPoints(p2, p3);
    let lineAD = undefined;
    let lineCD = undefined;
    let intersection_AB_CD = [];
    let intersection_AD_BC = [];

    if (
      isValid(lineAB) &&
      isValid(lineAC) &&
      isValid(lineBC)
    ) {
      do {
        p4.x = getRandomValue(p1.x - MAX, Math.min(p2.x, p3.x));
        p4.y = getRandomValue(p1.x + MIN, p1.x + MAX);
        lineAD = getLineFromTwoPoints(p1, p4);
        lineCD = getLineFromTwoPoints(p3, p4);
        if (isValid(lineAD) && isValid(lineCD)) {
          intersection_AB_CD = calculateIntersectionByLineAndLine(lineAB, lineCD);
          intersection_AD_BC = calculateIntersectionByLineAndLine(lineAD, lineBC);
        }
        if(!Array.isArray(intersection_AB_CD)) {
          intersection_AB_CD = [];
        }
        if (!Array.isArray(intersection_AD_BC)) {
          intersection_AD_BC = [];
        }
      }
      while (
        isIn(p4, lineAB) ||
        isIn(p4, lineAC) ||
        isIn(p4, lineBC) ||
        intersection_AB_CD.length === 0 ||
        intersection_AD_BC.length === 0
        );
      updateCoordinate(name[3], p4);
    }
  }
}

// Hinh thang
function generateTrapezoid(name: string, type: string) {
  if (isValid(name) && name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    switch (type) {
      case '': {
        // p2 represents point B
        const p2: CoordinateType = {
          x: getRandomValue(p1.x + Math.floor(MAX / 2), p1.x + MAX),
          y: p1.y,
        };
        updateCoordinate(name[1], p2);

        // p3 represents point C
        const p3: CoordinateType = {
          x: (getRandomValue(p2.x + Math.floor(MAX / 2), p2.x + MAX)),
          y: getRandomValue(p2.y + Math.floor(MAX / 2), p1.y + MAX),
        };
        updateCoordinate(name[2], p3);

        // p4 represents point D
        const p4: CoordinateType = {
          x: getRandomValue(p1.x - Math.floor(MAX / 2), p1.x - MAX),
          y: p3.y,
        };
        updateCoordinate(name[3], p4);
        break;
      }

      case 'cân': {
        // p2 represents point B
        const p2: CoordinateType = {
          x: getRandomValue(p1.x + MIN, p1.x + MAX),
          y: p1.y,
        };
        updateCoordinate(name[1], p2);

        // p3 represents point C
        const p3: CoordinateType = {
          x: getRandomValue(p2.x + MIN, p2.x + MAX),
          y: getRandomValue(p1.y + MIN, p1.y + MAX),
        };
        updateCoordinate(name[2], p3);

        const distanceX = Math.abs(p3.x - p2.x);
        const p4X = getRandomValue(0, 2) === 1 ?
          p1.x + distanceX :
          p1.x - distanceX;
        // p4 represents point D
        const p4: CoordinateType = {
          x: p1.x - distanceX,
          y: p3.y,
        };
        updateCoordinate(name[3], p4);
        break;
      }

      case 'vuông': {
        // TODO: vuong tai dau?
        break;
      }

      default: {
        break;
      }
    }
  }
}

// hinh binh hanh
function generateParallelogram(name: string) {
  if (isValid(name) && name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    // p2 represents point B
    let p2: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: p1.y,
    };
    updateCoordinate(name[1], p2);

    // p3 represents point C
    let p3: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: getRandomValue(p1.x + MIN, p1.x + MAX),
    };
    updateCoordinate(name[2], p3);

    // p4 represents point D
    let p4: CoordinateType = {
      x: p3.x - p2.x - p1.x,
      y: p3.y,
    };
    updateCoordinate(name[3], p4);
  }
}

function generateRectangle(name: string) {
  if (name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    // p2 represents point B
    const p2: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: p1.y,
    };
    updateCoordinate(name[1], p2);

    // p3 represents point C
    const p3: CoordinateType = {
      x: p2.x,
      y: getRandomValue(p2.y + MIN, p2.y + MAX),
    };
    updateCoordinate(name[2], p3);

    // p4 represents point D
    const p4: CoordinateType = {
      x: p1.x,
      y: p3.y,
    };
    updateCoordinate(name[3], p4);
  }
}

// Hinh thoi
function generateRhombus(name: string) {
  if (isValid(name) && name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    // p2 represents point B
    const p2: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: -getRandomValue(p1.y + MIN, p1.y + MAX),
    };
    updateCoordinate(name[1], p2);

    // p3 represents point C
    const p3: CoordinateType = {
      x: 2 * Math.abs(p2.x - p1.x),
      y: p1.y,
    };
    updateCoordinate(name[2], p3);

    // p4 represents point D
    const p4: CoordinateType = {
      x: p2.x,
      y: Math.abs(-p2.y - p1.y),
    };
    updateCoordinate(name[3], p4);
  }
}

function generateSquare(name: string) {
  if (isValid(name) && name.length === 4) {
    // p1 represents point A
    const p1: CoordinateType = {
      x: 0,
      y: 0,
      z: 0,
    };
    updateCoordinate(name[0], p1);

    // p2 represents point B
    const p2: CoordinateType = {
      x: getRandomValue(p1.x + MIN, p1.x + MAX),
      y: p1.y,
    };
    updateCoordinate(name[1], p2);

    // p3 represents point C
    const p3: CoordinateType = {
      x: p2.x,
      y: p2.y + calculateDistanceTwoPoints(p1, p2),
    };
    updateCoordinate(name[2], p3);

    // p4 represents point D
    const p4: CoordinateType = {
      x: p1.x,
      y: p3.y,
    };
    updateCoordinate(name[3], p4);
  }
}

function generateCircle(name: string) {
}

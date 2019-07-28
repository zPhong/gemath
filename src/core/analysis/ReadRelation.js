import type { CoordinateType } from '../../utils/types';
import dataViewModel from '../../ViewModel/DataViewModel.js';
import {
  calculateCircleEquationByCenterPoint,
  calculateDistanceTwoPoints,
  calculateInternalBisectLineEquation,
  calculateIntersectionByLineAndLine,
  calculateIntersectionEquationTypeWithCircleEquation,
  calculateLinesByAnotherLineAndAngle,
  calculateMiddlePoint,
  calculateParallelLineByPointAndLine,
  calculatePerpendicularLineByPointAndLine,
  calculateSymmetricalPoint,
  getAngleFromTwoLines,
  getLineFromTwoPoints,
  getMiddlePointFromThreePointsInALine,
  isIn
} from '../math/Math2D';
import {
  generatePointAlignmentInside,
  generatePointAlignmentOutside,
  getRandomPointInEquation,
  getRandomValue
} from '../math/Generation.js';

export function readRelation(relation: mixed, point: string) {
  let equationResults;
  if (relation.operation) {
    equationResults = analyzeOperationType(relation, point);
  } else if (relation.relation) {
    const relationType = relation.relation;
    switch (relationType) {
      case 'trung điểm':
      case 'thuộc':
      case 'không thuộc':
      case 'song song':
      case 'vuông góc':
      case 'phân giác':
      case 'thẳng hàng':
        equationResults = analyzeRelationType(relation, point);
        break;
      case 'cắt':
        equationResults = analyzeIntersectRelation(relation, point);
        break;
      default:
        break;
    }
  } else if (relation.outputType === 'shape') {
    const shapeType = Object.keys(relation).filter((key) => key !== 'type')[0];
    switch (shapeType) {
      case 'triangle':
        equationResults = getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(relation[shapeType][0]).coordinate,
          dataViewModel.getNodeInPointsMapById(point).coordinate
        );
        break;
      case 'quadrilateral':
      case 'rectangle':
      case 'square':
      case 'trapezoid':
      case 'parallelogram':
        if (shapeType !== 'quadrilateral') {
          let count = 0;
          relation[shapeType].split('').forEach((point) => {
            if (dataViewModel.isStaticNodeById(point)) {
              count++;
            }
          });
          const limit = shapeType === 'rectangle' || shapeType === 'square' ? 1 : 2;
          if (count > limit) {
            return;
          }
        }
        let index = relation[shapeType].indexOf(point);
        index = index === 0 ? relation[shapeType].length - 1 : index - 1;
        equationResults = getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(relation[shapeType][index]).coordinate,
          dataViewModel.getNodeInPointsMapById(point).coordinate
        );
        break;
      default:
        break;
    }
  }

  //TODO
  if (equationResults) {
    if (equationResults.coefficientX !== undefined) {
      // equationResults is linear
      return {
        a: 0,
        b: 0,
        c: equationResults.coefficientX,
        d: equationResults.coefficientY,
        e: equationResults.constantTerm
      };
    } else {
      // equationResults is circle
      return equationResults;
    }
  }
  return null;
}

function analyzeRelationType(relation: mixed, point: string): LinearEquation {
  let segmentIncludePoint, segmentNotIncludePoint;
  if (relation.segment) {
    relation.segment.forEach((segment: string) => {
      if (segment.includes(point)) {
        segmentIncludePoint = segment;
      } else {
        segmentNotIncludePoint = segment;
      }
    });
  }

  //points = [...new Set(points)].filter((point: string): boolean => !nonStaticPoints.includes(point));
  const relationType = relation.relation;

  if (
    relationType === 'trung điểm' ||
    relationType === 'thuộc' ||
    relationType === 'không thuộc' ||
    relationType === 'thẳng hàng'
  ) {
    let calculatedPoint;
    if (segmentIncludePoint) {
      const otherStaticPoint = relation.point[0];
      const otherStaticNodeInSegment = dataViewModel.getNodeInPointsMapById(segmentIncludePoint.replace(point, ''));

      if (!otherStaticNodeInSegment.coordinate.x && !otherStaticNodeInSegment.coordinate.y) {
        return null;
      }

      if (relationType === 'trung điểm') {
        calculatedPoint = calculateSymmetricalPoint(
          otherStaticNodeInSegment.coordinate,
          dataViewModel.getNodeInPointsMapById(otherStaticPoint).coordinate,
          segmentIncludePoint.indexOf(point) === 1
        );

        dataViewModel.updateCoordinate(point, calculatedPoint);
      }
    } else if (segmentNotIncludePoint) {
      switch (relationType) {
        case 'trung điểm':
          calculatedPoint = calculateMiddlePoint(
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[0]).coordinate,
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[1]).coordinate
          );
          dataViewModel.updateCoordinate(point, calculatedPoint);
          break;
        case 'thuộc':
          calculatedPoint = generatePointAlignmentInside(
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[0]).coordinate,
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[1]).coordinate
          );
          dataViewModel.updateCoordinate(point, calculatedPoint);
          break;
        case 'không thuộc':
          calculatedPoint = generatePointAlignmentOutside(
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[0]).coordinate,
            dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[1]).coordinate,
            getRandomValue(0, 2) === 1
          );

          dataViewModel.getData.getAdditionSegment.push(`${point}${segmentNotIncludePoint[0]}`);
          dataViewModel.updateCoordinate(point, calculatedPoint);
          break;
        default:
          break;
      }
    } else {
      const points = relation.point;
      const index = points.indexOf(point);
      if (index === 1) {
        calculatedPoint = generatePointAlignmentInside(
          dataViewModel.getNodeInPointsMapById(points[0]).coordinate,
          dataViewModel.getNodeInPointsMapById(points[2]).coordinate
        );
        dataViewModel.updateCoordinate(point, calculatedPoint);
      } else {
        calculatedPoint = generatePointAlignmentOutside(
          dataViewModel.getNodeInPointsMapById(points[index === 2 ? 0 : 1]).coordinate,
          dataViewModel.getNodeInPointsMapById(points[index === 2 ? 1 : 2]).coordinate,
          index === 2
        );
        dataViewModel.updateCoordinate(point, calculatedPoint);
      }

      return getLineFromTwoPoints(
        dataViewModel.getNodeInPointsMapById(points[0]).coordinate,
        dataViewModel.getNodeInPointsMapById(points[1]).coordinate
      );
    }

    return getLineFromTwoPoints(
      dataViewModel.getNodeInPointsMapById(relation.segment[0][0]).coordinate,
      dataViewModel.getNodeInPointsMapById(relation.segment[0][1]).coordinate
    );
  } else if (relationType === 'song song' || relationType === 'vuông góc') {
    //undefined point
    for (let i = 0; i < 2; i++) {
      if (!dataViewModel.isValidCoordinate(segmentNotIncludePoint[i])) {
        return;
      }
    }

    const staticLineEquation = getLineFromTwoPoints(
      dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[0]).coordinate,
      dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[1]).coordinate
    );

    const otherStaticPoint = segmentIncludePoint.replace(point, '');

    if (!dataViewModel.isValidCoordinate(otherStaticPoint)) {
      return;
    }

    let calculatedLineEquation;
    if (relationType === 'vuông góc') {
      calculatedLineEquation = calculatePerpendicularLineByPointAndLine(
        dataViewModel.getNodeInPointsMapById(otherStaticPoint).coordinate,
        staticLineEquation
      );

      const isInStaticLine = isIn(
        dataViewModel.getNodeInPointsMapById(otherStaticPoint).coordinate,
        staticLineEquation
      );
      const calculatedPoint = isInStaticLine
        ? getRandomPointInEquation(calculatedLineEquation)
        : calculateIntersectionByLineAndLine(calculatedLineEquation, staticLineEquation);
      dataViewModel.updateCoordinate(point, calculatedPoint);
    }
    if (relationType === 'song song') {
      calculatedLineEquation = calculateParallelLineByPointAndLine(
        dataViewModel.getNodeInPointsMapById(otherStaticPoint).coordinate,
        staticLineEquation
      );

      const calculatedPoint = getRandomPointInEquation(calculatedLineEquation);

      dataViewModel.updateCoordinate(point, calculatedPoint);
    }
    return calculatedLineEquation;
  } else if (relationType === 'phân giác') {
    if (relation.angle) {
      const angle = relation.angle[0];
      if (angle.includes(point)) {
        return;
      }

      const staticLineEquation = getLineFromTwoPoints(
        dataViewModel.getNodeInPointsMapById(angle[0]).coordinate,
        dataViewModel.getNodeInPointsMapById(angle[2]).coordinate
      );

      const calculatedLineEquation = calculateInternalBisectLineEquation(
        getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(angle[0]).coordinate,
          dataViewModel.getNodeInPointsMapById(angle[1]).coordinate
        ),
        getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(angle[1]).coordinate,
          dataViewModel.getNodeInPointsMapById(angle[2]).coordinate
        ),
        dataViewModel.getNodeInPointsMapById(angle[0]).coordinate,
        dataViewModel.getNodeInPointsMapById(angle[2]).coordinate
      );

      const calculatedPoint = calculateIntersectionByLineAndLine(calculatedLineEquation, staticLineEquation);
      dataViewModel.updateCoordinate(point, calculatedPoint);

      return calculatedLineEquation;
    }
  }
}

function analyzeIntersectRelation(relation: mixed, point: string): CoordinateType {
  for (let index in relation.segment) {
    for (let i = 0; i < 2; i++) {
      if (!dataViewModel.isValidCoordinate(relation.segment[index][i])) {
        return;
      }
    }
  }

  const calculatedLineEquationOne = getLineFromTwoPoints(
    dataViewModel.getNodeInPointsMapById(relation.segment[0][0]).coordinate,
    dataViewModel.getNodeInPointsMapById(relation.segment[0][1]).coordinate
  );
  const calculatedLineEquationTwo = getLineFromTwoPoints(
    dataViewModel.getNodeInPointsMapById(relation.segment[1][0]).coordinate,
    dataViewModel.getNodeInPointsMapById(relation.segment[1][1]).coordinate
  );

  const calculatedPoint = calculateIntersectionByLineAndLine(calculatedLineEquationOne, calculatedLineEquationTwo);
  dataViewModel.updateCoordinate(point, calculatedPoint);
}

//chỉ xử lý : = , *
function analyzeOperationType(relation: mixed, point: string): any {
  const objectType = relation.segment ? 'segment' : 'angle';
  const valueData = {};

  const objectsIncludePoint = [];

  for (let index in relation[objectType]) {
    const object = relation[objectType][index];
    if (object.includes(point)) {
      objectsIncludePoint.push(object);
    }
    let isStatic = true;
    object.split('').forEach((objPoint) => {
      if (objPoint !== point && !dataViewModel.isStaticNodeById(objPoint)) {
        isStatic = false;
      }
    });

    if (!isStatic) {
      return;
    }

    valueData[object] =
      objectType === 'segment'
        ? calculateDistanceTwoPoints(
            dataViewModel.getNodeInPointsMapById(object[0]).coordinate,
            dataViewModel.getNodeInPointsMapById(object[1]).coordinate
          )
        : getAngleFromTwoLines(
            getLineFromTwoPoints(
              dataViewModel.getNodeInPointsMapById(object[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(object[1]).coordinate
            ),
            getLineFromTwoPoints(
              dataViewModel.getNodeInPointsMapById(object[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(object[2]).coordinate
            )
          );
  }

  //điểm cần tính phụ thuộc 1 điểm duy nhất
  if (objectsIncludePoint.length === 1) {
    const index = relation[objectType].indexOf(objectsIncludePoint[0]);
    const staticObject = relation[objectType][index === 0 ? 1 : 0];
    let staticValue;
    if (relation[objectType].length > 1) {
      staticValue = index === 0 ? relation.value * valueData[staticObject] : valueData[staticObject] / relation.value;
    } else {
      staticValue = relation.value[0];
    }

    if (objectType === 'segment') {
      return calculateCircleEquationByCenterPoint(
        dataViewModel.getNodeInPointsMapById(objectsIncludePoint[0].replace(point, '')).coordinate,
        staticValue
      );
    }
    const staticLineInAngle = getLineFromTwoPoints(
      dataViewModel.getNodeInPointsMapById(objectsIncludePoint[0].replace(point, '')[0]).coordinate,
      dataViewModel.getNodeInPointsMapById(objectsIncludePoint[0].replace(point, '')[1]).coordinate
    );

    return calculateLinesByAnotherLineAndAngle(
      staticLineInAngle,
      dataViewModel.getNodeInPointsMapById(objectsIncludePoint[0].replace(point, '')[1]).coordinate,
      staticValue
    );
  }
  if (objectsIncludePoint.length === 2) {
    if (objectType === 'segment') {
      const staticPointOne = objectsIncludePoint[0].replace(point, '');
      const staticPointTwo = objectsIncludePoint[1].replace(point, '');
      //cần check thêm loại shape
      if (!dataViewModel.isStaticNodeById(staticPointOne) || !dataViewModel.isStaticNodeById(staticPointTwo)) {
        return;
      }

      const staticLineEquation = getLineFromTwoPoints(
        dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
        dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
      );

      const staticDistance = calculateDistanceTwoPoints(
        dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
        dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
      );

      const isAlign = isIn(dataViewModel.getNodeInPointsMapById(point).coordinate, {
        a: 0,
        b: 0,
        c: staticLineEquation.coefficientX,
        d: staticLineEquation.coefficientY,
        e: staticLineEquation.constantTerm
      });

      const ratio = +relation.value[0];
      if (isAlign) {
        let calculatedPoint;
        const betweenPoint = getMiddlePointFromThreePointsInALine(
          dataViewModel.getNodeInPointsMapById(point).coordinate,
          dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
          dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
        );

        if (betweenPoint === dataViewModel.getNodeInPointsMapById(point).coordinate) {
          calculatedPoint = calculateIntersectionEquationTypeWithCircleEquation(
            staticLineEquation,
            calculateCircleEquationByCenterPoint(
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              (ratio * staticDistance) / (ratio + 1)
            )
          );

          [...calculatedPoint].forEach((p) => {
            const result = getMiddlePointFromThreePointsInALine(
              p,
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
            );
            if (result === p) {
              calculatedPoint = p;
            }
          });
        }
        if (betweenPoint === dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate && ratio < 1) {
          calculatedPoint = calculateIntersectionEquationTypeWithCircleEquation(
            staticLineEquation,
            calculateCircleEquationByCenterPoint(
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              (ratio * staticDistance) / (1 - ratio)
            )
          );

          [...calculatedPoint].forEach((p) => {
            const result = getMiddlePointFromThreePointsInALine(
              p,
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
            );
            if (result === dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate) {
              calculatedPoint = p;
            }
          });
        }
        if (betweenPoint === dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate && ratio > 1) {
          calculatedPoint = calculateIntersectionEquationTypeWithCircleEquation(
            staticLineEquation,
            calculateCircleEquationByCenterPoint(
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              (ratio * staticDistance) / (ratio - 1)
            )
          );

          [...calculatedPoint].forEach((p) => {
            const result = getMiddlePointFromThreePointsInALine(
              p,
              dataViewModel.getNodeInPointsMapById(staticPointOne).coordinate,
              dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate
            );
            if (result === dataViewModel.getNodeInPointsMapById(staticPointTwo).coordinate) {
              calculatedPoint = p;
            }
          });
        }

        dataViewModel.updateCoordinate(point, calculatedPoint);

        return staticLineEquation;
      } else {
      }
      return null;
    }
  }
}
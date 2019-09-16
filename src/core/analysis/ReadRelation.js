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
  isIn,
  calculateIntersectionTwoCircleEquations,
  isVectorInSameLine,
  isVectorSameDirection,
  calculateExternalBisectLineEquation,
  calculateVector,
  calculateTangentEquation,
  calculateTangentIntersectPointsByPointOutsideCircle
} from '../math/Math2D';
import {
  generatePointAlignmentInside,
  generatePointAlignmentOutside,
  generatePointMiddleTwoPoints,
  getRandomPointInEquation,
  getRandomValue
} from '../math/Generation.js';
import ErrorService from '../../utils/ErrorHandleService';
import { ShapeAffectBySegmentChange, TwoStaticPointRequireShape } from '../definition/define';

export function readRelation(relation: mixed, point: string) {
  let equationResults;

  dataViewModel.executingRelation = relation;
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
      case 'phân giác ngoài':
      case 'phân giác trong':
      case 'thẳng hàng':
        equationResults = analyzeRelationType(relation, point);
        break;
      case 'cắt':
        equationResults = analyzeIntersectRelation(relation, point);
        break;
      case 'tiếp tuyến':
        equationResults = analyzeTangentRelation(relation, point);
        break;
      default:
        equationResults = null;
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
      case 'rhombus':
      case 'trapezoid':
      case 'parallelogram':
        if (shapeType !== 'quadrilateral') {
          let count = 0;
          relation[shapeType].split('').forEach((point) => {
            if (dataViewModel.isStaticNodeById(point)) {
              count++;
            }
          });
          const limit = TwoStaticPointRequireShape.includes(shapeType) ? 1 : 2;
          if (count > limit) {
            return;
          }
        }
        let index = relation[shapeType].indexOf(point);
        if (index === relation[shapeType].length - 1) {
          equationResults = getLineFromTwoPoints(
            dataViewModel.getNodeInPointsMapById(relation[shapeType][index]).coordinate,
            dataViewModel.getNodeInPointsMapById(relation[shapeType][0]).coordinate
          );
        } else {
          index = index === 0 ? relation[shapeType].length - 1 : index - 1;
          equationResults = getLineFromTwoPoints(
            dataViewModel.getNodeInPointsMapById(relation[shapeType][index]).coordinate,
            dataViewModel.getNodeInPointsMapById(point).coordinate
          );
        }
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
    if (relation.circle) {
      calculatedPoint = getRandomPointInEquation(dataViewModel.getCircleEquation(relation.circle[0]));
      dataViewModel.updateCoordinate(relation.point[0], calculatedPoint);
      return dataViewModel.getCircleEquation(relation.circle[0]);
    }
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
    if (!segmentNotIncludePoint) {
      return;
    }
    const otherStaticPoint = segmentIncludePoint.replace(point, '');
    if (!dataViewModel.isValidCoordinate(otherStaticPoint) && !dataViewModel.isValidCoordinate(point)) {
      const point = generatePointMiddleTwoPoints(
        dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[0]).coordinate,
        dataViewModel.getNodeInPointsMapById(segmentNotIncludePoint[1]).coordinate
      );
      if (point) {
        dataViewModel.updateCoordinate(otherStaticPoint, point);
      }
    }
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

      if (!isInStaticLine) {
        dataViewModel.getData.getAdditionSegment.push(`${point}${segmentNotIncludePoint[1]}`);
        dataViewModel.getData.getAdditionSegment.push(`${point}${segmentNotIncludePoint[0]}`);
      }

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
  } else if (relationType.includes('phân giác')) {
    const isExternal = relationType === 'phân giác ngoài';

    if (relation.angle) {
      const angle = relation.angle[0];
      if (angle.includes(point)) {
        return;
      }

      const staticLineEquation = getLineFromTwoPoints(
        dataViewModel.getNodeInPointsMapById(angle[0]).coordinate,
        dataViewModel.getNodeInPointsMapById(angle[2]).coordinate
      );
      let calculatedLineEquation;
      if (isExternal) {
        calculatedLineEquation = calculateExternalBisectLineEquation(
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

        const calculatedPoint = getRandomPointInEquation(calculatedLineEquation);
        dataViewModel.updateCoordinate(point, calculatedPoint);
      } else {
        calculatedLineEquation = calculateInternalBisectLineEquation(
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
      }

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
  if (relation.segment && relation.segment.length === 2) {
    const calculatedLineEquationOne = getLineFromTwoPoints(
      dataViewModel.getNodeInPointsMapById(relation.segment[0][0]).coordinate,
      dataViewModel.getNodeInPointsMapById(relation.segment[0][1]).coordinate
    );
    const calculatedLineEquationTwo = getLineFromTwoPoints(
      dataViewModel.getNodeInPointsMapById(relation.segment[1][0]).coordinate,
      dataViewModel.getNodeInPointsMapById(relation.segment[1][1]).coordinate
    );

    relation.segment.forEach((segment: string) => {
      dataViewModel.getData.getAdditionSegment.push(`${relation.point[0]}${segment[0]}`);
      dataViewModel.getData.getAdditionSegment.push(`${relation.point[0]}${segment[1]}`);
    });

    const calculatedPoint = calculateIntersectionByLineAndLine(calculatedLineEquationOne, calculatedLineEquationTwo);

    dataViewModel.updateCoordinate(relation.point[0], calculatedPoint);
  } else if (relation.circle && relation.circle.length === 2) {
    const roots = calculateIntersectionTwoCircleEquations(
      dataViewModel.getCircleEquation(relation.circle[0]),
      dataViewModel.getCircleEquation(relation.circle[1])
    );

    roots.forEach((root: CoordinateType, index: number) => {
      if (relation.point[index]) {
        dataViewModel.updateCoordinate(relation.point[index], root);
      }
    });
  } else {
    const pointOne = dataViewModel.getNodeInPointsMapById(relation.segment[0][0]).coordinate;
    const pointTwo = dataViewModel.getNodeInPointsMapById(relation.segment[0][1]).coordinate;
    let roots = calculateIntersectionTwoCircleEquations(
      getLineFromTwoPoints(pointOne, pointTwo),
      dataViewModel.getCircleEquation(relation.circle[0])
    );

    roots = roots.filter(
      (root: CoordinateType): boolean =>
        JSON.stringify(root) !== JSON.stringify(pointOne) && JSON.stringify(root) !== JSON.stringify(pointTwo)
    );
    if (relation.point.length === 2) {
      roots.forEach((root: CoordinateType, index: number) => {
        if (!relation.point[index]) {
          ErrorService.showError('200');
        } else {
          dataViewModel.updateCoordinate(relation.point[index], root);
        }
      });
    } else {
      dataViewModel.updateCoordinate(relation.point[0], roots[getRandomValue(0, roots.length - 1)]);
    }
  }
}

//chỉ xử lý : = , *
function analyzeOperationType(relation: mixed, point: string): any {
  const objectType = relation.segment ? 'segment' : 'angle';
  const valueData = {};

  const objectsIncludePoint = [];
  if (relation.value && relation[objectType].length === 1) {
    valueData[relation[objectType][0]] = relation.value[0];
    objectsIncludePoint.push(relation[objectType][0]);
  } else {
    for (let index in relation[objectType]) {
      const object = relation[objectType][index];
      if (object.includes(point)) {
        objectsIncludePoint.push(object);
      }

      valueData[object] =
        objectType === 'segment'
          ? calculateDistanceTwoPoints(
              dataViewModel.getNodeInPointsMapById(object[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(object[1]).coordinate
            )
          : (getLineFromTwoPoints(
              dataViewModel.getNodeInPointsMapById(object[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(object[1]).coordinate
            ),
            getLineFromTwoPoints(
              dataViewModel.getNodeInPointsMapById(object[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(object[2]).coordinate
            ));
    }
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

    return calculateLineEquationByAngleRelation(objectsIncludePoint[0], staticValue);
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

function calculateLineEquationByAngleRelation(angleName: string, angleValue: number): EquationType {
  const checkResult = checkAndModifiedAngle(angleName);
  const modifiedAngleName = checkResult.angle;
  const staticPoint = dataViewModel.getNodeInPointsMapById(modifiedAngleName[0]).coordinate;
  const rootPoint = dataViewModel.getNodeInPointsMapById(modifiedAngleName[1]).coordinate;
  const changedPoint = dataViewModel.getNodeInPointsMapById(modifiedAngleName[2]).coordinate;
  const calculatedEquation = calculateLinesByAnotherLineAndAngle(rootPoint, staticPoint, changedPoint, angleValue);

  const intersectPoint = calculateIntersectionByLineAndLine(
    calculatedEquation,
    getLineFromTwoPoints(staticPoint, rootPoint)
  );
  const newRootPoint = calculateIntersectionTwoCircleEquations(
    calculatedEquation,
    calculateCircleEquationByCenterPoint(changedPoint, calculateDistanceTwoPoints(changedPoint, rootPoint))
  ).sort((rootOne: CoordinateType, rootTwo: CoordinateType): number => {
    return calculateDistanceTwoPoints(intersectPoint, rootOne) - calculateDistanceTwoPoints(intersectPoint, rootTwo);
  })[0];

  //move newRoot to oldRoot
  const transitionVector = calculateVector(newRootPoint, rootPoint, false);
  if (checkResult.isChanged === false) {
    dataViewModel.updateCoordinate(modifiedAngleName[2], {
      x: changedPoint.x + transitionVector.x,
      y: changedPoint.y + transitionVector.y
    });

    dataViewModel.replaceSetOfEquation(
      modifiedAngleName[2],
      getLineFromTwoPoints(rootPoint, changedPoint),
      calculateParallelLineByPointAndLine(rootPoint, calculatedEquation)
    );

    return;
  }

  dataViewModel.updateCoordinate(modifiedAngleName[0], {
    x: staticPoint.x - transitionVector.x,
    y: staticPoint.y - transitionVector.y
  });

  dataViewModel.replaceSetOfEquation(
    modifiedAngleName[1],
    getLineFromTwoPoints(rootPoint, changedPoint),
    calculateParallelLineByPointAndLine(rootPoint, calculatedEquation)
  );

  return null;
}

function reExecuteNode(array: Array<string>) {
  console.log(`----------------`);
  dataViewModel.reExecuteNode(array);
}

function getShapeAffectList(): Array<string> {
  const shapeList = [];

  //get list of shape name
  dataViewModel.getData.relationsResult.shapes.forEach((shapeData: Object): boolean => {
    const shapeType = Object.keys(shapeData).filter((key: string): boolean => key !== 'outputType')[0];
    if (ShapeAffectBySegmentChange.includes(shapeType)) {
      shapeList.push(shapeData[shapeType]);
    }
  });

  return shapeList;
}

function checkAndModifiedAngle(angle: string): { angle: string, isChanged: boolean } {
  for (let i = 0; i < angle.length; i++) {
    if (!dataViewModel.isValidCoordinate(angle[i])) {
      const coordinate = dataViewModel.getNodeInPointsMapById(angle[i]).coordinate;
      dataViewModel.updateCoordinate(angle[i], {
        x: coordinate.x || getRandomValue(-10, 10),
        y: coordinate.y || getRandomValue(-10, 10)
      });
      return { angle, isChanged: false };
    }
  }
  const shapeList = getShapeAffectList();

  const secondLine = `${angle[1]}${angle[2]}`;

  for (let i = 0; i < shapeList.length; i++) {
    const shape = shapeList[i];
    const secondLineVector = calculateVector(
      dataViewModel.getNodeInPointsMapById(secondLine[0]).coordinate,
      dataViewModel.getNodeInPointsMapById(secondLine[1]).coordinate
    );

    let modifiedAngleName = angle;
    let updatePoint = modifiedAngleName[2];

    if (
      isVectorInSameLine(
        calculateVector(
          dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[1]).coordinate
        ),
        secondLineVector
      ) ||
      isVectorInSameLine(
        calculateVector(
          dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[2]).coordinate
        ),
        secondLineVector
      )
    ) {
      modifiedAngleName = angle
        .split('')
        .reverse()
        .join('');
    }

    let isChanged = modifiedAngleName !== angle;

    if (
      isVectorInSameLine(
        calculateVector(
          dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[2]).coordinate
        ),
        secondLineVector
      )
    ) {
      if (angle[1] === shape[0]) {
        if (
          isVectorSameDirection(
            calculateVector(
              dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[2]).coordinate
            ),
            secondLineVector
          )
        ) {
          updatePoint = shape[2];
          isChanged = false;
        }
      } else if (angle[1] === shape[2]) {
        if (
          isVectorSameDirection(
            calculateVector(
              dataViewModel.getNodeInPointsMapById(shape[2]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[0]).coordinate
            ),
            secondLineVector
          )
        ) {
          updatePoint = shape[0];
          isChanged = false;
        }
      }
    } else if (
      isVectorInSameLine(
        calculateVector(
          dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[3]).coordinate
        ),
        secondLineVector
      )
    ) {
      if (angle[1] === shape[1]) {
        if (
          isVectorSameDirection(
            calculateVector(
              dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[3]).coordinate
            ),
            secondLineVector
          )
        ) {
          updatePoint = shape[3];
          isChanged = false;
        }
      } else if (angle[1] === shape[3]) {
        if (
          isVectorSameDirection(
            calculateVector(
              dataViewModel.getNodeInPointsMapById(shape[3]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[1]).coordinate
            ),
            secondLineVector
          )
        ) {
          updatePoint = shape[1];
          isChanged = false;
        }
      }
    }

    reExecuteNode([modifiedAngleName[1], updatePoint]);
    const result = modifiedAngleName.replace(modifiedAngleName[2], updatePoint);

    return { angle: result, isChanged };
  }
  return { angle, isChanged: false };
}

function analyzeTangentRelation(relation: mixed, point: string): any {
  const otherPointInSegment = relation.segment[0].replace(point, '');
  if (!dataViewModel.isStaticNodeById(otherPointInSegment)) {
    return;
  }

  const tangentPointCoordinate = dataViewModel.getNodeInPointsMapById(otherPointInSegment).coordinate;
  const circleEquation = dataViewModel.getCircleEquation(relation.circle[0]);
  let tangentEquation;
  if (isIn(tangentPointCoordinate, circleEquation)) {
    tangentEquation = calculateTangentEquation(circleEquation, tangentPointCoordinate);
    dataViewModel.updateCoordinate(point, getRandomPointInEquation(tangentEquation));
    dataViewModel.getData.getAdditionSegment.push(`${otherPointInSegment}${relation.circle[0]}`);
  } else {
    const roots = calculateTangentIntersectPointsByPointOutsideCircle(circleEquation, tangentPointCoordinate);
    const result = filterTangentPoint(roots, circleEquation);
    tangentEquation = result.tangentEquation;
    dataViewModel.updateCoordinate(point, result.point);
    dataViewModel.getData.getAdditionSegment.push(`${point}${relation.circle[0]}`);
  }

  return tangentEquation;
}

function filterTangentPoint(
  roots: Array<CoordinateType>,
  circleEquation: EquationType
): { equation: EquationType, point: CoordinateType } {
  const filterRoots = roots.filter((root: CoordinateType): boolean => !dataViewModel.isCoordinateDuplicated(root));

  return filterRoots.map((root: CoordinateType): { equation: EquationType, point: CoordinateType } => {
    return {
      equation: calculateTangentEquation(circleEquation, root),
      point: root
    };
  })[getRandomValue(0, filterRoots.length - 1)];
}

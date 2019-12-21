import type {
	CoordinateType,
	EquationType,
	NodeRelationType,
	NodeType,
} from '../../utils/types';
import dataViewModel from '../../ViewModel/DataViewModel.js';
import {
	calculateCircleEquationByCenterPoint,
	calculateCircumCircleEquation,
	calculateDistanceTwoPoints,
	calculateEscribedCirclesEquation,
	calculateInCircleEquation,
	calculateIntersectionByLineAndLine,
	calculateIntersectionTwoCircleEquations,
	calculateMiddlePoint,
	calculateParallelLineByPointAndLine,
	calculatePerpendicularLineByPointAndLine,
	calculateSymmetricalPoint,
	getLineFromTwoPoints,
} from '../math/Math2D';
import {
	getRandomPointInEquation,
	getRandomValue,
} from '../math/Generation';
import {
	circleType,
	mappingShapeType,
	shapeRules,
	TwoStaticPointRequireShape,
} from '../definition/define';
import { generateGeometry } from '../math/GenerateGeometry';
import { readRelation } from './ReadRelation';
import ErrorService from '../error/ErrorHandleService';
import { isQuadraticEquation } from '../../utils/checker.js';
import { Operation } from '../math/MathOperation.js';

let shape, shapeName, shapeType;

export function readPointsMap(): Array | {} {
  dataViewModel.createPointDetails();
  console.table(JSON.parse(JSON.stringify(dataViewModel.getData.getPointsMap)));
  let isChangeShape = false;
  while (!dataViewModel.isPointsMapStatic()) {
    //get node to calculate
    const executingNode = dataViewModel.getNextExecuteNode();
    if (!executingNode) break;
    executeRelations(executingNode);

    //Update calculated value to pointsMap
    if (dataViewModel.getData.getPointDetails.has(executingNode.id)) {
      const roots = dataViewModel.getData.getPointDetails.get(executingNode.id).roots;
      console.log(executingNode.id, roots);

      if (typeof roots === 'string') {
        ErrorService.showError('400');
        return;
      }
      if (roots.length > 0) {
        let coordinate;
        if (dataViewModel.isNeedRandomCoordinate(executingNode.id)) {
          coordinate = roots[getRandomValue(0, roots.length - 1)];
        } else {
          const nodeDirectionInfo = dataViewModel.getData.getPointDirectionMap[executingNode.id];
          if (nodeDirectionInfo) {
            const staticPointCoordinate = dataViewModel.getNodeInPointsMapById(nodeDirectionInfo.root).coordinate;
            if (roots.length > 1) {
              const rootsDirection = roots.map((root) => ({
                coordinate: root,
                isRight: Operation.Compare(staticPointCoordinate.x, root.x),
                isUp: Operation.Compare(staticPointCoordinate.y, root.y)
              }));

              const coordinateMatch = rootsDirection
                .map((directionInfo) => {
                  let matchCount = 0;
                  if (directionInfo.isRight === nodeDirectionInfo.isRight) {
                    matchCount++;
                  }
                  if (directionInfo.isUp === nodeDirectionInfo.isUp) {
                    matchCount++;
                  }
                  return {
                    coordinate: directionInfo.coordinate,
                    matchCount
                  };
                })
                .sort((a, b) => b.matchCount - a.matchCount)[0];

              coordinate = coordinateMatch.coordinate;
            } else {
              coordinate = roots[0];
            }
          } else {
            coordinate = roots[0];
          }
        }
        if (coordinate) {
          dataViewModel.updateCoordinate(executingNode.id, coordinate);
        }
      }
    }

    //update static Node
    dataViewModel.updateStaticNode();

    if (shapeRules[shapeName] && shapeRules[shapeName][shapeType]) {
      makeCorrectShape(shape, shapeName, shapeRules[shapeName][shapeType], executingNode.id);
      isChangeShape = true;
    }
  }
  // if (isChangeShape) {
  //   dataViewModel.getData.getPointsMap.forEach((node: NodeType) => {
  //     //Update calculated value to pointsMap
  //     if (dataViewModel.getData.getPointDetails.has(node.id)) {
  //       const setOfEquation = dataViewModel.getData.getPointDetails.get(node.id).setOfEquation;

  //       if (setOfEquation.length === 1 && isQuadraticEquation(setOfEquation[0])) {
  //         dataViewModel.updateCoordinate(node.id, getRandomPointInEquation(setOfEquation[0]));
  //         return;
  //       }
  //       const roots = dataViewModel.getData.getPointDetails.get(node.id).roots;
  //       if (typeof roots === 'string') {
  //         ErrorService.showError('400');
  //         return;
  //       }

  //       if (roots.length >= 0) {
  //         let coordinate;
  //         if (roots.length === 0) {
  //           if (setOfEquation.length >= 2) {
  //             const _roots = calculateIntersectionTwoCircleEquations(setOfEquation[0], setOfEquation[1]);
  //             coordinate = _roots[getRandomValue(0, _roots.length)];
  //           }
  //         } else if (dataViewModel.isNeedRandomCoordinate(node.id)) {
  //           coordinate = roots[getRandomValue(0, roots.length - 1)];
  //         } else {
  //           const nodeDirectionInfo = dataViewModel.getData.getPointDirectionMap[node.id];
  //           if (nodeDirectionInfo) {
  //             const staticPointCoordinate = dataViewModel.getNodeInPointsMapById(nodeDirectionInfo.root).coordinate;
  //             if (roots.length > 1) {
  //               const rootsDirection = roots.map((root) => {
  //                 return {
  //                   coordinate: root,
  //                   isRight: Operation.Compare(staticPointCoordinate.x, root.x),
  //                   isUp: Operation.Compare(staticPointCoordinate.y, root.y)
  //                 };
  //               });
  //               const coordinateMatch = rootsDirection
  //                 .map((directionInfo) => {
  //                   let matchCount = 0;
  //                   if (directionInfo.isRight === nodeDirectionInfo.isRight) {
  //                     matchCount++;
  //                   }
  //                   if (directionInfo.isUp === nodeDirectionInfo.isUp) {
  //                     matchCount++;
  //                   }
  //                   return {
  //                     coordinate: directionInfo.coordinate,
  //                     matchCount
  //                   };
  //                 })
  //                 .sort((a, b) => b.matchCount - a.matchCount);
  //               coordinate = coordinateMatch[0].coordinate;
  //             } else {
  //               coordinate = roots[0];
  //             }
  //           } else {
  //             const filterRoots = roots.filter(
  //               (root) =>
  //                 (Operation.isEqual(dataViewModel.getNodeInPointsMapById(node.id).coordinate.x, root.x) &&
  //                   Operation.isEqual(dataViewModel.getNodeInPointsMapById(node.id).coordinate.y, root.y) &&
  //                   !dataViewModel.isCoordinateExist(node.id, root)) ||
  //                 !dataViewModel.isCoordinateExist(node.id, root)
  //             );
  //             coordinate = filterRoots[getRandomValue(0, filterRoots.length - 1)];
  //           }
  //         }
  //         if (coordinate) {
  //           dataViewModel.updateCoordinate(node.id, coordinate);
  //         }
  //       }
  //     }
  //   });
  // }

  return dataViewModel.getData.getPointsMap.map((node) => ({
    id: node.id,
    coordinate: node.coordinate
  }));
}

function executeRelations(node: NodeType) {
  const executingNodeRelations = _makeUniqueNodeRelation(node.dependentNodes);

  executingNodeRelations.forEach((relation) => {
    let relationEquation;
    if (relation.outputType === 'shape') {
      shapeName = Object.keys(relation).filter((key) => key !== 'type')[0];
      shapeType = mappingShapeType[relation.type] || 'normal';
      shape = relation[shapeName];
      if (circleType.includes(shapeType)) {
        let data = null;
        switch (shapeType) {
          case 'nội tiếp':
            data = calculateInCircleEquation(
              dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[2]).coordinate
            );
            break;
          case 'ngoại tiếp':
            data = calculateCircumCircleEquation(
              dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[2]).coordinate
            );
            break;
          case 'bàng tiếp':
            data = calculateEscribedCirclesEquation(
              dataViewModel.getNodeInPointsMapById(shape[0]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[1]).coordinate,
              dataViewModel.getNodeInPointsMapById(shape[2]).coordinate,
              dataViewModel.getNodeInPointsMapById(relation.escribedPoint[0]).coordinate
            );
            break;
          default:
            break;
        }
        if (data) {
          dataViewModel.circlesData[relation.point[0]] = data;
          dataViewModel.updateCoordinate(relation.point[0], data.center);
        } else {
          ErrorService.showError('400');
        }
      } else if (!dataViewModel.isExecutedRelation(relation)) {
        generateGeometry(relation[shapeName], shapeName, relation.type);
        setPointsDirection(relation[shapeName]);
      }
      if (shapeRules[shapeName] && shapeRules[shapeName][shapeType]) {
        makeCorrectShape(shape, shapeName, shapeRules[shapeName][shapeType], node.id);
      }
    }

    if (!dataViewModel.isExecutedRelation(relation)) {
      relationEquation = readRelation(relation, node.id);
      if (relationEquation) {
        if (Array.isArray(relationEquation)) {
          relationEquation = relationEquation[getRandomValue(0, relationEquation.length)];
        }

        dataViewModel.executePointDetails(node.id, relationEquation);
      }
      dataViewModel.getData.getExecutedRelations.push(relation);
    }
  });
  if (dataViewModel.isReCalculated) {
    dataViewModel.isReCalculated = false;
    return;
  }
  dataViewModel.getData.getExecutedNode.push(node.id);
}

function setPointsDirection(shape: string) {
	if (shape.length < 4) {
		return;
	}
	let i = 0;
	shape.split('')
	     .forEach((point, index) => {
		     if (index > 0) {
			     // Case point D => set anchor point is A
			     i = index === shape.length - 1
			         ? 1
			         : index;
			     const pointCoordinate = dataViewModel.getNodeInPointsMapById(point).coordinate;
			     const rootCoordinate = dataViewModel.getNodeInPointsMapById(shape[i - 1]).coordinate;

			     dataViewModel.getData.getPointDirectionMap[point] = {
				     root: shape[i - 1],
				     isRight: Operation.Compare(rootCoordinate.x, pointCoordinate.x),
				     isUp: Operation.Compare(rootCoordinate.y, pointCoordinate.y),
           };
           
           console.log({root: shape[i - 1],
            isRight: Operation.Compare(rootCoordinate.x, pointCoordinate.x),
            isUp: Operation.Compare(rootCoordinate.y, pointCoordinate.y),
          })
		     }
	     });
}

export function _makeUniqueNodeRelation(dependentNodes: Array<NodeRelationType>): Array<any> {
  let result: Array<NodeRelationType> = [];

  for (let index = 0; index < dependentNodes.length; index++) {
    let temp = true;

    for (let i = 0; i < result.length; i++) {
      if (dependentNodes[index].relation === result[i]) {
        temp = false;
        break;
      }
    }

    if (temp) result.push(dependentNodes[index].relation);
  }
  return result;
}

function makeCorrectShape(shape: string, shapeName: string, rules: string, executePoint: string) {
  const staticPointCountRequire = TwoStaticPointRequireShape.includes(shapeName) ? 2 : 1;
  let staticPoints = shape.replace(executePoint, '').split('');
  // check other points are static
  let count = 0;
  for (let i = 0; i < staticPoints.length; i++) {
    if (dataViewModel.isStaticNodeById(staticPoints[i])) {
      count++;
    }
  }

  if (count < staticPointCountRequire) {
    return;
  }

  // get node information
  let arrayRules = rules.split(new RegExp('&', 'g'));

  const executePointIndex = shape.indexOf(executePoint);
  let nodeSetEquations = [];
  if (arrayRules.length > 0) {
    arrayRules.forEach((rule) => {
      const relationType = rule[2];
      if (rule.includes(executePointIndex)) {
        let equation;
        // eslint-disable-next-line default-case
        switch (relationType) {
          case '|':
            equation = getLinearEquationByParallelRule(rule, shape, executePointIndex);
            break;
          case '^':
            if (rule[1] === rule[3]) {
              equation = getLinearEquationByPerpendicularRule(rule, shape, executePointIndex);
            } else {
              equation = updateCoordinateBySpecialPerpendicularRule(rule, shape, executePointIndex);
            }
            break;
          case '=':
            equation = getLinearEquationsByEqualRule(rule, shape, executePointIndex);
            break;
        }
        if (equation) {
          nodeSetEquations = nodeSetEquations.concat(equation);
        }
      }
    });
    nodeSetEquations.forEach((equation) => {
      dataViewModel.executePointDetails(executePoint, equation);
    });
  }
}

function updateCoordinateBySpecialPerpendicularRule(rule: string, shape: string, executePointIndex: number) {
  let includeLine, nonIncludeLine;

  const staticLines = rule
    .split('^')
    .filter(
      (line: string): boolean =>
        dataViewModel.isStaticNodeById(shape[line[0]]) && dataViewModel.isStaticNodeById(shape[line[1]])
    );

  rule.split('^').forEach((line: string) => {
    if (line.includes(executePointIndex)) {
      includeLine = line;
    } else {
      nonIncludeLine = line;
    }
  });

  const shapePoints = shape
    .split('')
    .map((point: string): CoordinateType => dataViewModel.getNodeInPointsMapById(point).coordinate);

  if (staticLines.length === 1) {
    const intersectPoint = calculateMiddlePoint(shapePoints[staticLines[0][0]], shapePoints[staticLines[0][1]]);
    const nonStaticLine = staticLines[0] === nonIncludeLine ? includeLine : nonIncludeLine;

    const staticPointIndex = nonStaticLine.split('').filter((pointIndex: string): boolean => {
      return dataViewModel.isStaticNodeById(shape[pointIndex]);
    })[0];

    if (staticPointIndex === undefined) {
      const equation = calculatePerpendicularLineByPointAndLine(
        intersectPoint,
        getLineFromTwoPoints(shapePoints[staticLines[0][0]], shapePoints[staticLines[0][1]])
      );
      const coordinate = calculateIntersectionByLineAndLine(
        equation,
        getLineFromTwoPoints(shapePoints[staticLines[0][0]], shapePoints[nonStaticLine[0]])
      );

      dataViewModel.updateCoordinate(shape[nonStaticLine[0]], coordinate);
      return equation;
    } else if (shape[nonStaticLine.replace(staticPointIndex, '')]) {
      const calculatedCoordinate = calculateSymmetricalPoint(shapePoints[staticPointIndex], intersectPoint);
      dataViewModel.updateCoordinate(shape[nonStaticLine.replace(staticPointIndex, '')], calculatedCoordinate);
      const equation = calculatePerpendicularLineByPointAndLine(
        shapePoints[staticPointIndex],
        getLineFromTwoPoints(intersectPoint, shapePoints[staticPointIndex])
      );
      return equation;
    }
  } else if (staticLines.length === 0 && nonIncludeLine) {
    //line perpendicular with line include 1 static point
    const intersectPoint = calculateIntersectionByLineAndLine(
      calculatePerpendicularLineByPointAndLine(
        shapePoints[executePointIndex],
        getLineFromTwoPoints(shapePoints[nonIncludeLine[0]], shapePoints[nonIncludeLine[1]])
      ),
      getLineFromTwoPoints(shapePoints[nonIncludeLine[0]], shapePoints[nonIncludeLine[1]])
    );
    let calculatedCoordinate;
    //update coordinate
    const otherPointInIncludeLine = includeLine.replace(executePointIndex, '');
    if (!dataViewModel.isStaticNodeById(shape[otherPointInIncludeLine])) {
      calculatedCoordinate = calculateSymmetricalPoint(shapePoints[executePointIndex], intersectPoint);
      dataViewModel.updateCoordinate(shape[otherPointInIncludeLine], calculatedCoordinate);
    } else {
      calculatedCoordinate = calculateSymmetricalPoint(shapePoints[otherPointInIncludeLine], intersectPoint);
      dataViewModel.updateCoordinate(shape[executePointIndex], calculatedCoordinate);
    }
    const nonStaticPointIndex = nonIncludeLine.split('').filter((pointIndex: string): boolean => {
      return !dataViewModel.isStaticNodeById(shape[pointIndex]);
    })[0];

    calculatedCoordinate = calculateSymmetricalPoint(
      shapePoints[nonIncludeLine.replace(nonStaticPointIndex, '')],
      intersectPoint
    );

    dataViewModel.updateCoordinate(shape[nonStaticPointIndex], calculatedCoordinate);
  }
}

function getLinearEquationsByEqualRule(rule: string, shape: string, executePointIndex: number): Array<EquationType> {
  const lines = rule.split('=');
  let staticLine;
  let nonStaticLine;
  // points with non-static point;
  lines.forEach((line) => {
    const count = line.split('').filter((point: string): boolean => dataViewModel.isStaticNodeById(shape[point]))
      .length;
    if (count === 2 && !staticLine) {
      staticLine = line;
    } else {
      nonStaticLine = line;
    }
  });
  if (staticLine) {
    const count = staticLine.split('').filter((point: string): boolean => dataViewModel.isStaticNodeById(shape[point]))
      .length;

    if (count < 2) {
      return [];
    }

    const otherPoint = shape[nonStaticLine.replace(executePointIndex, '')];
    const radius = calculateDistanceTwoPoints(
      dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
      dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
    );
    //point is outside static line
    if (!staticLine.includes(executePointIndex)) {
      return [
        calculateCircleEquationByCenterPoint(dataViewModel.getNodeInPointsMapById(otherPoint).coordinate, radius)
      ];
    }
  }
}

function getLinearEquationByParallelRule(rule: string, shape: string, executePointIndex: number): EquationType {
  const lines = rule.split('|');
  let staticLine;
  let nonStaticLine;
  // points with non-static point;
  lines.forEach((line) => {
    const count = line.split('').filter((point: string): boolean => dataViewModel.isStaticNodeById(shape[point]))
      .length;
    if (count === 2 && !staticLine) {
      staticLine = line;
    } else {
      nonStaticLine = line;
    }
  });
  if (
    staticLine &&
    nonStaticLine.includes(executePointIndex) &&
    dataViewModel.isStaticNodeById(shape[nonStaticLine.replace(executePointIndex, '')])
  ) {
  	const point = dataViewModel.getNodeInPointsMapById(shape[nonStaticLine.replace(executePointIndex, '')]).coordinate;
  	const line = getLineFromTwoPoints(
	  dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
	  dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
    );
  	const pLine = calculateParallelLineByPointAndLine(point, line);
    return [pLine];
  }
}

function getLinearEquationByPerpendicularRule(rule: string, shape: string, executePointIndex: number) {
  const lines = rule.split('^');
  let staticLine;
  let nonStaticLine;
  // points with non-static point;
  lines.forEach((line) => {
    const count = line.split('').filter((point: string): boolean => dataViewModel.isStaticNodeById(shape[point]))
      .length;
    if (count === 2 && !staticLine) {
      staticLine = line;
    } else {
      nonStaticLine = line;
    }
  });

  if (staticLine && nonStaticLine.includes(executePointIndex) && !staticLine.includes(executePointIndex)) {
    return [
      calculatePerpendicularLineByPointAndLine(
        //Common point
        dataViewModel.getNodeInPointsMapById(shape[rule[1]]).coordinate,
        //line
        getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
        )
      )
    ];
  }
}

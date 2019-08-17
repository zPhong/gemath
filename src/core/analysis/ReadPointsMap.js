import type { CoordinateType, EquationType, NodeRelationType, NodeType } from '../../utils/types';
import dataViewModel from '../../ViewModel/DataViewModel.js';
import {
  calculateCircleEquationByCenterPoint,
  calculateDistanceTwoPoints,
  calculateIntersectionByLineAndLine,
  calculateIntersectionTwoCircleEquations,
  calculateParallelLineByPointAndLine,
  calculatePerpendicularLineByPointAndLine,
  getLineFromTwoPoints,
  calculateInCircleEquation,
  calculateCircumCircleEquation
} from '../math/Math2D';
import { getRandomValue } from '../math/Generation';
import { mappingShapeType, shapeRules, TwoStaticPointRequireShape, circleType } from '../definition/define';
import { generateGeometry } from '../math/GenerateGeometry';
import { readRelation } from './ReadRelation';
import ErrorService from '../../utils/ErrorHandleService.js';
import appData from '../../Model/AppData.js';

export function readPointsMap(): Array | {} {
  dataViewModel.createPointDetails();
  console.table(dataViewModel.getData.getPointsMap);

  while (!dataViewModel.isPointsMapStatic()) {
    //get node to calculate
    const executingNode = dataViewModel.getNextExecuteNode();

    if (!executingNode) break;

    const executingNodeRelations = _makeUniqueNodeRelation(executingNode.dependentNodes);
    let shape, shapeName, shapeType;

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
            default:
              break;
          }
          if (data) {
            dataViewModel.circlesData[relation.point[0]] = data;
            dataViewModel.updateCoordinate(relation.point[0], data.center);
          } else {
            ErrorService.ErrorMessage('400');
          }
          return;
        } else if (!dataViewModel.isExecutedRelation(relation)) {
          generateGeometry(relation[shapeName], shapeName, relation.type);
          setPointsDirection(relation[shapeName]);
        }
      }
      relationEquation = readRelation(relation, executingNode.id);
      if (relationEquation) {
        if (Array.isArray(relationEquation)) {
          relationEquation = relationEquation[getRandomValue(0, relationEquation.length)];
        }
        dataViewModel.executePointDetails(executingNode.id, relationEquation);
      }

      if (!dataViewModel.isExecutedRelation(relation)) {
        //
        dataViewModel.getData.getExecutedRelations.push(relation);
      }
    });

    if (shapeRules[shapeName] && shapeRules[shapeName][shapeType]) {
      makeCorrectShape(shape, shapeName, shapeRules[shapeName][shapeType], executingNode.id);
    }

    //Update calculated value to pointsMap
    if (dataViewModel.getData.getPointDetails.has(executingNode.id)) {
      const roots = dataViewModel.getData.getPointDetails.get(executingNode.id).roots;
      if (typeof roots === 'string') {
        ErrorService.showError('400');
        return;
      }
      if (roots.length > 0) {
        let coordinate;
        if (dataViewModel.isNeedRandomCoordinate(executingNode.id)) {
          coordinate = roots[getRandomValue(0, roots.length)];
        } else {
          const nodeDirectionInfo = dataViewModel.getData.getPointDirectionMap[executingNode.id];
          const staticPointCoordinate = dataViewModel.getNodeInPointsMapById(nodeDirectionInfo.root).coordinate;
          if (roots.length > 1) {
            const rootsDirection = roots.map((root) => ({
              coordinate: root,
              isRight: root.x > staticPointCoordinate.x,
              isUp: root.y < staticPointCoordinate.y
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
        }
        dataViewModel.updateCoordinate(executingNode.id, coordinate);
      }
    }

    //appModel.updatePointsMap(executingNode);
    dataViewModel.getData.getExecutedNode.push(executingNode.id);

    //update static Node
    dataViewModel.updateStaticNode();
  }

  return dataViewModel.getData.getPointsMap.map((node) => ({
    id: node.id,
    coordinate: node.coordinate
  }));
}

function setPointsDirection(shape: string) {
  shape.split('').forEach((point, index) => {
    if (index > 0) {
      const pointCoordinate = dataViewModel.getNodeInPointsMapById(point).coordinate;
      const rootCoordinate = dataViewModel.getNodeInPointsMapById(shape[index - 1]).coordinate;

      dataViewModel.getData.getPointDirectionMap[point] = {
        root: shape[index - 1],
        isRight: pointCoordinate.x > rootCoordinate.x,
        isUp: pointCoordinate.y < rootCoordinate.y
      };
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

function makeCorrectShape(shape: string, shapeName: string, rules: string, nonStaticPoint: string) {
  const staticPointCountRequire = TwoStaticPointRequireShape.includes(shapeName) ? 2 : 1;
  let staticPoints = shape.replace(nonStaticPoint, '').split('');
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

  const nonStaticIndex = shape.indexOf(nonStaticPoint);

  let nodeSetEquations = [];
  if (arrayRules.length > 0) {
    arrayRules.forEach((rule) => {
      const relationType = rule[2];
      if (rule.includes(nonStaticIndex)) {
        let equation;
        // eslint-disable-next-line default-case
        switch (relationType) {
          case '|':
            equation = getLinearEquationByParallelRule(rule, shape, nonStaticIndex);
            break;
          case '^':
            if (rule[1] === nonStaticIndex && rule[3] === nonStaticIndex) {
              equation = getLinearPerpendicularByParallelRule(rule, shape, nonStaticIndex);
            }
            break;
          case '=':
            equation = getLinearEquationsByEqualRule(rule, shape, nonStaticIndex);
            break;
        }
        if (equation) {
          nodeSetEquations = nodeSetEquations.concat(equation);
        }
      }
    });

    if (nodeSetEquations.length > 1) {
      const coordinate = calculateIntersectionByLineAndLine(nodeSetEquations[0], nodeSetEquations[1]);
      dataViewModel.updateCoordinate(nonStaticPoint, coordinate);
    }
    nodeSetEquations.forEach((equation) => {
      dataViewModel.executePointDetails(nonStaticPoint, equation);
    });
  }
}

function getLinearEquationsByEqualRule(rule: string, shape: string, nonStaticIndex: number): Array<EquationType> {
  const lines = rule.split('=');
  let staticLine;
  let nonStaticLines = [];
  // points with non-static point;
  let staticPoints = [];
  lines.forEach((line) => {
    if (line.includes(nonStaticIndex)) {
      nonStaticLines.push(line);
      staticPoints.push(line.replace(nonStaticIndex, ''));
    } else {
      staticLine = line;
    }
  });

  if (staticLine) {
    //1 circle equation
    if (staticLine.includes(nonStaticLines[0].replace(nonStaticIndex, ''))) {
      const radius = calculateDistanceTwoPoints(
        dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
        dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
      );

      return [
        calculateCircleEquationByCenterPoint(
          dataViewModel.getNodeInPointsMapById(shape[nonStaticLines[0].replace(nonStaticIndex, '')]).coordinate,
          radius
        )
      ];
    }

    // tam giác đều
    const radius = calculateDistanceTwoPoints(
      dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
      dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
    );

    const circleOne = calculateCircleEquationByCenterPoint(
      dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
      radius
    );

    const circleTwo = calculateCircleEquationByCenterPoint(
      dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
      radius
    );

    const nonStaticNodeId = shape[nonStaticIndex].id;

    dataViewModel.updateCoordinate(nonStaticNodeId, calculateIntersectionTwoCircleEquations(circleOne, circleTwo));
    return [circleOne, circleTwo];
  }
}

function getLinearEquationByParallelRule(rule: string, shape: string, nonStaticIndex: number): EquationType {
  const lines = rule.split('|');
  let staticLine, nonStaticLine;
  lines.forEach((line) => {
    if (line.includes(nonStaticIndex)) {
      nonStaticLine = line;
    } else {
      staticLine = line;
    }
  });

  return [
    calculateParallelLineByPointAndLine(
      //point
      dataViewModel.getNodeInPointsMapById(shape[nonStaticLine.replace(nonStaticIndex, '')]).coordinate,
      //line
      getLineFromTwoPoints(
        dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
        dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
      )
    )
  ];
}

function getLinearPerpendicularByParallelRule(rule: string, shape: string, nonStaticIndex: number) {
  const lines = rule.split('^');
  let staticLine;
  let nonStaticLines = [];
  // points with non-static point;
  let staticPoints = [];
  lines.forEach((line) => {
    if (line.includes(nonStaticIndex)) {
      nonStaticLines.push(line);
      staticPoints.push(line.replace(nonStaticIndex, ''));
    } else {
      staticLine = line;
    }
  });

  if (staticLine) {
    return [
      calculatePerpendicularLineByPointAndLine(
        //point
        dataViewModel.getNodeInPointsMapById(shape[nonStaticLines[0].replace(nonStaticIndex, '')]).coordinate,
        //line
        getLineFromTwoPoints(
          dataViewModel.getNodeInPointsMapById(shape[staticLine[0]]).coordinate,
          dataViewModel.getNodeInPointsMapById(shape[staticLine[1]]).coordinate
        )
      )
    ];
  }
}

function _calculatePointCoordinate(node: NodeType): CoordinateType {
  if (node.isStatic) {
    return node.coordinate;
  }

  const executingNodeRelation = _makeUniqueNodeRelation(node.dependentNodes);
  for (let i = 0; i < executingNodeRelation; i++) {
    // TODO: calculate point
    if (executingNodeRelation[i].relation.outputType === 'shape') {
      if (!dataViewModel.isExecutedRelation(executingNodeRelation[i].relation)) {
        // generate point
        // ...
        dataViewModel.getData.getExecutedRelations.push(executingNodeRelation[i].relation);
      }
    }

    if (node.dependentNodes[i].relation.outputType === 'define') {
    }
  }

  node.isStatic = true;
  return node;
}

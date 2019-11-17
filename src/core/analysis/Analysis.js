// @flow

import { objectWithPoint } from '../definition/define.js';
import type { DrawingDataType, NodeRelationType, NodeType } from '../../utils/types.js';
import dataViewModel from '../../ViewModel/DataViewModel';
import { readPointsMap } from './ReadPointsMap';
import { makeRoundCoordinate } from '../math/Math2D.js';
import ErrorService from '../error/ErrorHandleService.js';
import { Operation } from '../math/MathOperation.js';

let RelationPointsMap: Array<NodeType> = [];

export function analyzeResult(validatedResult): DrawingDataType {
  validatedResult = deleteWrongRelation(validatedResult);
  const shapes = validatedResult.shapes;

  shapes.forEach((shape) => {
    createPointsMapByShape(shape);
  });

  const relations = validatedResult.relations;
  relations.forEach((relation) => {
    createPointsMapByRelation(relation).forEach((node) => {
      updateMap(node, dataViewModel.getData.getPointsMap);
    });
  });

  trimPointsMap();

  let result = {};

  readPointsMap();
  result.points = dataViewModel.getData.getPointsMap.map((node: NodeType) => {
    return {
      id: node.id,
      coordinate: {
        x: Operation.Round(node.coordinate.x, 3),
        y: Operation.Round(node.coordinate.y, 3)
      }
    };
  });

  _RoundObject(dataViewModel.circlesData);
  result.segments = [...getArraySegments(validatedResult), ...dataViewModel.getData.getAdditionSegment];
  return result;
}

function _RoundObject(object: mixed): mixed {
  if (typeof object === 'object') {
    Object.keys(object).forEach((key: string) => {
      object[key] = _RoundObject(object[key]);
    });
    return object;
  }
  return Operation.Round(object);
}

function deleteWrongRelation(validatedResult) {
  const shapes = validatedResult.shapes;
  let isHaveTriangle = false;
  let triangle = '';
  shapes.forEach((shape: mixed) => {
    if (shape.triangle && !shape.point) {
      isHaveTriangle = true;
      triangle = shape.triangle;
    }
  });

  if (!isHaveTriangle) {
    return validatedResult;
  }

  let segments = [];
  let angles = [];
  let relationSegments = [];
  let relationAngles = [];

  validatedResult.relations.forEach((relation) => {
    if (relation.outputType === 'define' && !!relation.value) {
      if (relation.segment) {
        relation.segment.forEach((segment: string) => {
          if (!segments.includes(segment) && triangle.includes(segment[0]) && triangle.includes(segment[1])) {
            segments.push(segment);
            relationSegments.push(relation);
          }
        });
      }

      if (relation.angle) {
        relation.angle.forEach((angle: string) => {
          if (triangle.includes(angle[0]) && triangle.includes(angle[1]) && triangle.includes(angle[2])) {
            angles.push(angle);
            relationAngles.push(relation);
          }
        });
      }
    }
  });

  let deleteRelationList = [];

  if (angles.length > 1) {
    if (angles.length > 2) {
      angles = angles.splice(0, 2);
      deleteRelationList = deleteRelationList.concat(relationAngles.splice(2, relationAngles.length - 2));
    }
    if (segments.length > 0) {
      const segment = [angles[0][1], angles[1][1]].sort().join('');
      let position = -1;
      segments.some((value: string, index: number) => {
        if (
          value
            .split('')
            .sort()
            .join('') === segment
        ) {
          position = index;
          return true;
        }
        return false;
      });


      if (position >= 0) {
        relationSegments.splice(position, 1);
      } else {
        const firstRelation = relationSegments[0];

        const _segment = firstRelation.segment[0];
        const _value = firstRelation.value;
        let sum = 0;
        const oppositeAngle = relationAngles
          .filter((relation) => {
            sum += parseInt(relation.value);
            return !_segment.includes(relation.angle[0][1]);
          })
          .map((relation) => parseInt(relation.value))[0];

        const calculatedSegmentValue =
          (_value * Math.sin(((180 - sum) * Math.PI) / 360)) / Math.sin((oppositeAngle * Math.PI) / 360);

        validatedResult.relations.push({
          operation: '=',
          outputType: 'define',
          segment: [segment],
          value: [`${calculatedSegmentValue}`]
        });
      }
      deleteRelationList = deleteRelationList.concat(relationSegments);
    }
  } else {
    if (segments.length > 1) {
      if (segments.length === 2) {
        relationAngles.shift();
      }
      deleteRelationList = relationAngles;
    }
  }

  console.log(deleteRelationList);
  const relations = validatedResult.relations.filter((relation: mixed): boolean => {
    for (let i = 0; i < deleteRelationList.length; i++) {
      if (JSON.stringify(relation) === JSON.stringify(deleteRelationList[i])) {
        return false;
      }
    }
    return true;
  });

  deleteRelationList.forEach((relation: mixed) => {
    ErrorService.updateErrorInInput(relation);
  });

  return { shapes, relations };
}

function getArraySegments(validatedResult): Array<string> {
  let result: Array<string> = [];

  const shapes = validatedResult.shapes;

  shapes.forEach((shape) => {
    result = result.concat(getShapeSegments(shape));
  });

  const relations = validatedResult.relations;

  relations.forEach((relation) => {
    result = result.concat(getRelationSegments(relation));
  });

  return result.filter((item, index, array) => array.indexOf(item) === index);
}

function getRelationSegments(relation: mixed): Array<string> {
  let result = [];
  if (relation.segment) {
    result = result.concat(relation.segment);
  }
  if (relation.angle) {
    relation.angle.forEach((angle: string) => {
      result = result.concat([`${angle[0]}${angle[1]}`, `${angle[1]}${angle[2]}`]);
    });
  }

  return result;
}

function getShapeSegments(shape: any): Array<string> {
  const shapeName = Object.keys(shape).filter((key) => key !== 'type')[0];
  let points = shape[shapeName].split('').filter((point) => point === point.toUpperCase());

  const result = [];

  for (let i = 0; i < points.length; i++) {
    if (i === points.length - 1) {
      result.push(points[0] + points[i]);
    } else {
      result.push(points[i] + points[i + 1]);
    }
  }

  return result;
}

function trimPointsMap() {
  dataViewModel.getData.setPointsMap = dataViewModel.getData.getPointsMap.map((node: NodeType): NodeType => ({
    ...node,
    dependentNodes: unique(node.dependentNodes)
  }));
}

function unique(dependentNodes: Array<NodeRelationType>): Array<NodeRelationType> {
  let result = [];

  dependentNodes.forEach((node) => {
    for (let i = 0; i < result.length; i++) {
      if (JSON.stringify(node) === JSON.stringify(result[i])) return;
    }
    result.push(node);
  });

  return result;
}

function createPointsMapByShape(shape: any) {
  const shapeName = Object.keys(shape).filter((key) => key !== 'type')[0];
  let points = shape[shapeName].split('').filter((point) => point === point.toUpperCase());

  //points = sortPriority([...points]);
  points = getPointOrderInShape(shape[shapeName]);

  let objectPointsMap;
  // đường tròn ngoại tiếp, nội tiếp
  if (shape.point) {
    objectPointsMap = points.map((point: string) => {
      return createNode(shape.point[0], [{ id: point, relation: shape }]);
    });
  } else {
    objectPointsMap = points.map((point: string, index: number) => {
      return createNode(point, [{ id: points[0], relation: shape }]);
    });
  }
  objectPointsMap.forEach((node: NodeType) => {
    updateMap(node, dataViewModel.getData.getPointsMap);
  });
}

export function getPointOrderInShape(shape: string): Array<string> {
  const angles = [];
  const segments = [];
  if (dataViewModel.getData.getRelationsResult.relations) {
    dataViewModel.getData.getRelationsResult.relations.forEach((relation) => {
      if (!relation.angle || relation.outputType !== 'define') {
      } else {
        angles.push(relation.angle[0]);
      }
      if (!relation.segment || relation.outputType !== 'define') {
      } else {
        segments.push(relation.segment[0]);
      }
    });

    const shapePointCount = {};
    console.log(segments, angles);
    segments.forEach((segment: string) => {
      if (!shape.includes(segment[1]) && !shape.includes(segment[0])) {
        return;
      }
      segment.split('').forEach((point, index) => {
        //don't check middle point
        if (shapePointCount[point]) {
          shapePointCount[point] += 1;
        } else {
          shapePointCount[point] = 1;
        }
      });
    });
    console.log(shapePointCount);

    angles.forEach((angle: string): void => {
      if (!shape.includes(angle[1])) {
        return;
      }
      angle.split('').forEach((point, index) => {
        //don't check middle point
        if (shapePointCount[point]) {
          if (index !== 1) {
            shapePointCount[point] += 1;
          } else {
            shapePointCount[point] += 3;
          }
        } else {
          if (index !== 1) {
            shapePointCount[point] = 1;
          } else {
            shapePointCount[point] = 3;
          }
        }
      });
    });

    return Object.keys(shapePointCount).sort((a, b) => -shapePointCount[a] + shapePointCount[b]);
  }
  return shape.split('');
}

function createPointsMapByRelation(relation: any) {
  RelationPointsMap = [];
  objectWithPoint.forEach((objectType: string) => {
    if (relation[objectType]) {
      relation[objectType].forEach((object) => {
        let points = object.split('').filter((point) => point === point.toUpperCase());

        const objectPointsMap = points.map((point: string, index: number) => {
          return createNode(point);
        });

        objectPointsMap.forEach((node: NodeType) => {
          updateMap(node, RelationPointsMap);
        });
      });
    }
  });

  RelationPointsMap = [...RelationPointsMap].sort((nodeOne: NodeType, nodeTwo: NodeType): number => {
    const index1 = findIndexByNodeId(nodeOne.id, dataViewModel.getData.getPointsMap);
    const index2 = findIndexByNodeId(nodeTwo.id, dataViewModel.getData.getPointsMap);
    if (index1 === -1 && index2 === -1) return 1;
    if (index1 >= 0 && index2 >= 0) return index1 - index2;
    return index2 - index1;
  });

  let lastObjectPoints = [];

  if (relation.angle && relation.outputType === 'define' && !!relation.value) {
    const index1 = findIndexByNodeId(relation.angle[0][0], dataViewModel.getData.getPointsMap);
    const index2 = findIndexByNodeId(relation.angle[0][2], dataViewModel.getData.getPointsMap);
    if (index1 < 0) {
      lastObjectPoints.push(relation.angle[0][0]);
    }
    if (index2 < 0) {
      lastObjectPoints.push(relation.angle[0][2]);
    }
    if (index1 >= 0 && index2 >= 0) {
      lastObjectPoints = [index1 > index2 ? relation.angle[0][0] : relation.angle[0][2]];
    }
  } else {
    lastObjectPoints = getDependentObject();
  }

  if (lastObjectPoints.length === RelationPointsMap.length) {
    lastObjectPoints = [lastObjectPoints[0]];
  }
  if (relation.relation === 'song song' || relation.relation === 'vuông góc' || relation.relation === 'phân giác') {
    lastObjectPoints = lastObjectPoints.filter(
      (point: string): boolean => !dataViewModel.getNodeInPointsMapById(point)
    );
  }
  lastObjectPoints.forEach((point) => {
    const index = findIndexByNodeId(point, RelationPointsMap);
    const currentNode = RelationPointsMap[index];
    RelationPointsMap.forEach((node) => {
      if (node.id !== point) {
        RelationPointsMap[index] = {
          ...currentNode,
          dependentNodes: [
            ...currentNode.dependentNodes,
            ...createDependentNodeOfRelation(node.id, relation, lastObjectPoints)
          ]
        };
      }
    });
  });

  return RelationPointsMap;
}

function getDependentObject(): Array<string> {
  let result: Array = [];
  const lastNode = RelationPointsMap[RelationPointsMap.length - 1];
  if (lastNode) {
    result.push(lastNode.id);

    lastNode.dependentNodes.forEach((node) => {
      const nodeIndex = findIndexByNodeId(node.id, dataViewModel.getData.getPointsMap);
      if (!result.includes(node.id) && nodeIndex !== -1 && !dataViewModel.getData.getPointsMap[nodeIndex].isStatic)
        result.push(node.id);
    });
  }
  return result;
}

function findIndexByNodeId(id: string, map: Array<NodeType | NodeRelationType>): number {
  for (let i = 0; i < map.length; i++) {
    if (map[i].id === id) return i;
  }
  return -1;
}

function createDependentNodeOfRelation(
  point: string,
  relation: any,
  exception: Array<string>
): Array<NodeRelationType> {
  const result: Array<NodeRelationType> = [];
  RelationPointsMap.forEach((node: NodeType) => {
    if (exception.includes(node.id)) return;
    result.push({ id: node.id, relation });
  });
  return result;
}

function createNode(id: string, dependentNodes?: Array<NodeRelationType>): any {
  const node = { id, coordinate: { x: undefined, y: undefined, z: 0 }, isStatic: false };
  const _dependentNodes = dependentNodes ? { dependentNodes } : { dependentNodes: [] };

  return { ...node, ..._dependentNodes };
}

function updateMap(node: NodeType, map: Array<NodeType>) {
  const index = findIndexByNodeId(node.id, map);
  if (index !== -1) {
    //merge dependentNodes
    const oldNode = map[index];
    map[index] = {
      ...oldNode,
      dependentNodes: [...oldNode.dependentNodes, ...node.dependentNodes]
    };
  } else {
    map.push(node);
    if (dataViewModel.getData.getPointsMap.length === 1) map[0].isStatic = true;
  }
}

// @flow

import { objectWithPoint } from '../definition/define.js';
import type { DrawingDataType, NodeRelationType, NodeType } from '../../utils/types.js';
import dataViewModel from '../../ViewModel/DataViewModel';
import { readPointsMap } from './ReadPointsMap';
import { makeRoundCoordinate } from '../math/Math2D.js';
import ErrorService from '../../utils/ErrorHandleService.js';

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
  result.points = dataViewModel.getData.getPointsMap.map((node: NodeType) => ({
    id: node.id,
    coordinate: makeRoundCoordinate(node.coordinate, 3)
  }));

  result.segments = [...getArraySegments(validatedResult), ...dataViewModel.getData.getAdditionSegment];
  return result;
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

  const segments = [];
  const relationSegments = [];
  const relationAngles = [];

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
            relationAngles.push(relation);
          }
        });
      }
    }
  });

  let deleteRelationList = [];

  if (segments.length > 1) {
    if (segments.length === 2) {
      relationAngles.shift();
    }
    deleteRelationList = relationAngles;
  }
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

function sortPriority(points) {
  return points.sort((el1: string, el2: string): number => {
    const index1 = findIndexByNodeId(el1, dataViewModel.getData.getPointsMap);
    const index2 = findIndexByNodeId(el2, dataViewModel.getData.getPointsMap);

    if (index1 === -1 && index2 === -1) {
      return 1;
    }
    if (index1 >= 0 && index2 >= 0) return 1;
    return index2 - index1;
  });
}

function createPointsMapByShape(shape: any) {
  const shapeName = Object.keys(shape).filter((key) => key !== 'type')[0];
  let points = shape[shapeName].split('').filter((point) => point === point.toUpperCase());

  points = sortPriority([...points]);

  if (dataViewModel.getData.getPointsMap.length === 0) {
    const shouldStaticPoint = getFirstStaticPointInShape(shape[shapeName]);
    points = [shouldStaticPoint].concat(points.filter((point) => point !== shouldStaticPoint));
  }

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
  console.log(objectPointsMap);
  objectPointsMap.forEach((node: NodeType) => {
    updateMap(node, dataViewModel.getData.getPointsMap);
  });
}

function getFirstStaticPointInShape(shape: string): string {
  const angles = [];
  const segments = [];
  if (dataViewModel.getData.getRelationsResult.relations) {
    dataViewModel.getData.getRelationsResult.relations.forEach((relation) => {
      if (!relation.angle || relation.outputType !== 'define') {
        return;
      } else {
        angles.push(relation.angle[0]);
      }
      if (!relation.segment || relation.outputType !== 'define') {
        return;
      } else {
        segments.push(relation.segment[0]);
      }
    });

    const shapePointCount = {};

    angles.forEach((angle: string): void => {
      if (!shape.includes(angle[1])) {
        return;
      }
      angle.split('').forEach((point, index) => {
        //don't check middle point
        if (index !== 1) {
          if (shapePointCount[point]) {
            shapePointCount[point] += 1;
          } else {
            shapePointCount[point] = 1;
          }
        }
      });
    });

    let minCountPoint = shape[0];
    Object.keys(shapePointCount).forEach((point) => {
      if (shapePointCount[point] < shapePointCount[minCountPoint]) {
        minCountPoint = point;
      }
    });

    return minCountPoint;
  }
  return shape[0];
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

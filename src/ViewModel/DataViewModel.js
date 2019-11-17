// @flow

import appData from '../Model/AppData';
import type { EquationType, PointDetailsType } from '../utils/types';
import { NodeType } from '../utils/types';
import GConst from '../core/config/values.js';
import { calculateIntersectionTwoCircleEquations, isIn, makeRoundCoordinate } from '../core/math/Math2D.js';
import { isQuadraticEquation } from '../utils/checker.js';
import { defineSentences } from '../core/definition/define';
import { defineInformation } from '../core/definition';
import { analyzeResult } from '../core/analysis/Analysis';
import RelationInputModel from '../Model/RelationInputModel';
import { observable, action, computed } from 'mobx';
import ErrorService from '../core/error/ErrorHandleService';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { isTwoEquationEqual } from '../core/math/Math2D';
import { getRandomValue } from '../core/math/Generation';
import { Operation } from '../core/math/MathOperation';

const NOT_FOUND = GConst.Number.NOT_FOUND;
const NOT_ENOUGH_SET = GConst.String.NOT_ENOUGH_SET;

class DataViewModel {
  @observable
  isReCalculated = false;

  @observable
  circlesData = {};

  @observable
  relationsInput: Array<RelationInputModel>;

  inputData: Array<mixed> = [];

  executedInputIndex: number;

  @observable
  executingRelation: mixed;

  constructor(appData) {
    this.data = appData;
    this.relationsInput = [
      new RelationInputModel('tam giác ABC'),
      new RelationInputModel('AB = 4'),
      new RelationInputModel('AC = 4'),
      new RelationInputModel('ACB = 60')
      //new RelationInputModel('ABC = 60')
    ];
  }

  @computed
  get RelationsInput() {
    return this.relationsInput;
  }

  @computed
  get isInputEmpty(): boolean {
    if (this.relationsInput.length === 1 && !this.relationsInput[0].value) {
      return true;
    }
    return false;
  }

  @action
  resetInputsStatus() {
    this.relationsInput.forEach((input: RelationInputModel) => {
      input.status = GConst.InputStatus.NORMAL;
    });
  }

  @action
  onInputChange(value: string, index: number) {
    const newRelationInput = { ...this.relationsInput[index] };
    newRelationInput.value = value;
    this.relationsInput[index] = newRelationInput;
    this.resetInputsStatus();
  }

  @action
  addNewInput() {
    this.relationsInput.push(new RelationInputModel(''));
  }

  @action
  removeInput(index: number) {
    this.relationsInput.splice(index, 1);
  }

  clear() {
    this.data.clear();
    this.inputData = [];
    this.circlesData = {};
    this.executedInputIndex = undefined;
    this.executingRelation = undefined;
  }

  get getData() {
    return this.data;
  }

  createPointDetails() {
    this.data.getPointsMap.forEach((node) => {
      const roots = this.isValidCoordinate(node.coordinate) ? [node.coordinate] : [];
      this._updatePointDetails(node.id, {
        setOfEquation: [],
        roots: roots,
        exceptedCoordinates: []
      });
    });
  }

  isNeedRandomCoordinate = (pointId: string): boolean => {
    const roots = this.data.getPointDetails.get(pointId).roots;
    if (roots) {
      for (let i = 0; i < roots.length; i++) {
        if (
          this.data.getPointDirectionMap[pointId] ||
          JSON.stringify(makeRoundCoordinate(roots[i])) ===
            JSON.stringify(makeRoundCoordinate(this.getNodeInPointsMapById(pointId).coordinate))
        ) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  updateCoordinate = (nodeId: string, coordinate: CoordinateType, f: number = 3): void => {
    const index = this.getIndexOfNodeInPointsMapById(nodeId);
    if (!coordinate) {
      ErrorService.showError('200');
    }

    const _coordinate = {};
    Object.keys(coordinate)
      .sort()
      .forEach((key: string) => {
        _coordinate[key] = coordinate[key];
      });
    if (index !== NOT_FOUND) {
      this.data.getPointsMap[index].coordinate = _coordinate;
    }
  };

  isStaticNode = (node: NodeType): boolean => {
    if (node.isStatic) return true;
    for (let i = 0; i < node.dependentNodes.length; i++) {
      if (!this.isExecutedRelation(node.dependentNodes[i].relation)) {
        return false;
      }
    }

    return this.data.getExecutedNode.includes(node.id);
  };

  reExecuteNode = (arrayPoint: Array<string>) => {
    this.isReCalculated = true;
    this.getData.pointsMap.forEach((node: NodeType, index: number) => {
      if (arrayPoint.includes(node.id)) {
        return;
      }
      this.getData.pointsMap[index].dependentNodes.forEach((dependence: NodeRelationType, index: number) => {
        if (dependence.relation.outputType === 'shape' && !dependence.relation.point && arrayPoint.length > 0) {
          this.getData.pointsMap[index].dependentNodes[index] = { ...dependence, id: arrayPoint[0] };
        }
      });
      this.getData.pointsMap[index].isStatic = false;
    });
    this.getData.__pointDetails__.clear();

    this.getData.executedNode = arrayPoint;
    const keepExecutedRelations = this.getData.executedRelations.filter(
      (relation: mixed): boolean => relation.outputType === 'shape'
    );
    this.getData.executedRelations = keepExecutedRelations;
  };

  isExecutedRelation = (relation: any): boolean => {
    for (let i = 0; i < this.data.getExecutedRelations.length; i++) {
      if (JSON.stringify(relation) === JSON.stringify(this.data.getExecutedRelations[i])) return true;
    }

    return false;
  };

  updateStaticNode = () => {
    const pointsMap = this.data.getPointsMap.map((node: NodeType): NodeType => {
      node.isStatic = this.isStaticNode(node);
      return node;
    });
    this.data.setPointsMap = pointsMap;
  };

  updatePointsMap = (node: NodeType) => {
    let index = this.getIndexOfNodeInPointsMapById(node.id);
    this.data.getPointsMap[index] = node;
  };

  isPointsMapStatic = (): boolean => {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (!this.data.getPointsMap[i].isStatic) return false;
    }
    return true;
  };

  isCoordinateExist(id: string, coordinate: CoordinateType): boolean {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (
        Operation.isEqual(this.data.getPointsMap[i].coordinate.x, coordinate.x) &&
        Operation.isEqual(this.data.getPointsMap[i].coordinate.y, coordinate.y)
      ) {
        return this.data.getPointsMap[i].id !== id;
      }
    }
    return false;
  }

  isValidCoordinate = (nodeId: string) => {
    if (nodeId) {
      const node = this.getNodeInPointsMapById(nodeId);
      if (node) {
        return node.coordinate.x !== undefined && node.coordinate.y !== undefined;
      }
    }
    return false;
  };

  getNextExecuteNode = (): NodeType => {
    const clonePointsMap = this.data.pointsMap
      .filter((node) => !this.data.executedNode.includes(node.id) && !this.isStaticNode(node))
      .sort(this.sortNodeByPriority);

    if (clonePointsMap.length > 0) return clonePointsMap[0];
    return null;
  };

  sortNodeByPriority = (nodeOne: NodeType, nodeTwo: NodeType): number => {
    const staticNodeOneCount = this.getDependentStaticNodeCount(nodeOne);
    const nodeOneData = {
      static: staticNodeOneCount,
      nonStatic: nodeOne.dependentNodes.length - staticNodeOneCount,
      dependence: nodeOne.dependentNodes.length,
      minRelationIndex: this.getMinIndexOfDependentNodeInRelationsList(nodeOne),
      index: this.getIndexOfNodeInPointsMap(nodeOne)
    };

    const staticNodeTwoCount = this.getDependentStaticNodeCount(nodeTwo);
    const nodeTwoData = {
      static: staticNodeTwoCount,
      nonStatic: nodeTwo.dependentNodes.length - staticNodeTwoCount,
      dependence: nodeTwo.dependentNodes.length,
      minRelationIndex: this.getMinIndexOfDependentNodeInRelationsList(nodeTwo),
      index: this.getIndexOfNodeInPointsMap(nodeTwo)
    };

    //get Max
    const rankingOrderDesc = ['static', 'dependence'];

    //get Min
    const rankingOrderAsc = ['nonStatic', 'minRelationIndex', 'index'];

    let rankOne = nodeOneData.static === nodeOneData.dependence ? '1' : '0';
    let rankTwo = nodeTwoData.static === nodeTwoData.dependence ? '1' : '0';

    rankingOrderDesc.forEach((key) => {
      if (nodeOneData[key] > nodeTwoData[key]) {
        rankOne += '1';
        rankTwo += '0';
      } else if (nodeOneData[key] === nodeTwoData[key]) {
        rankOne += '1';
        rankTwo += '1';
      } else {
        rankOne += '0';
        rankTwo += '1';
      }
    });

    rankingOrderAsc.forEach((key) => {
      if (nodeOneData[key] < nodeTwoData[key]) {
        rankOne += '1';
        rankTwo += '0';
      } else if (nodeOneData[key] === nodeTwoData[key]) {
        rankOne += '1';
        rankTwo += '1';
      } else {
        rankOne += '0';
        rankTwo += '1';
      }
    });

    return parseInt(rankTwo) - parseInt(rankOne);
  };

  getMinIndexOfDependentNodeInRelationsList = (node: NodeType) => {
    const indexArray = [];
    for (let i = 0; i < node.dependentNodes.length; i++) {
      indexArray.push(this.getIndexOfRelationInRelationsList(node.dependentNodes[i]));
    }

    return Math.min(...indexArray);
  };

  getIndexOfRelationInRelationsList = (relation: any): number => {
    const list = this.data.getRelationsResult.shapes.concat(this.data.getRelationsResult.relations);
    for (let i = 0; i < list.length; i++) {
      if (relation === list[i]) return i;
    }
    return NOT_FOUND;
  };

  getDependentStaticNodeCount = (node: NodeType): number => {
    let count = 0;
    for (let i = 0; i < node.dependentNodes.length; i++) {
      if (this.isStaticNodeById(node.dependentNodes[i].id)) count++;
    }

    return count;
  };

  getIndexOfNodeInPointsMap = (node): number => {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (node === this.data.getPointsMap[i]) return i;
    }
    return NOT_FOUND;
  };

  getIndexOfNodeInPointsMapById = (id: string): number => {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (id === this.data.getPointsMap[i].id) return i;
    }
    return NOT_FOUND;
  };

  getNodeInPointsMapById = (id: string): NodeType | null => {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (id === this.data.getPointsMap[i].id) {
        return this.data.getPointsMap[i];
      }
    }
    return null;
  };

  isStaticNodeById = (id: string): boolean => {
    for (let i = 0; i < this.data.getPointsMap.length; i++) {
      if (id === this.data.getPointsMap[i].id) {
        return this.isStaticNode(this.data.getPointsMap[i]);
      }
    }
    return false;
  };

  _calculateSet = (equations: Array<EquationType>) => {
    if (equations.length >= 2) {
      return calculateIntersectionTwoCircleEquations(equations[0], equations[1]);
    } else return NOT_ENOUGH_SET;
  };

  replaceSetOfEquation(pointId: string, searchEquation: EquationType, replaceEquation: EquationType) {
    if (!this.data.getPointDetails.has(pointId)) {
      this._updatePointDetails(pointId, {
        setOfEquation: [],
        roots: [],
        exceptedCoordinates: []
      });
    }
    const pointDetail = this.data.getPointDetails.get(pointId);
    const setOfEquation = pointDetail.setOfEquation;
    let isReplaceComplete = false;

    setOfEquation.forEach((equation: EquationType, index: number) => {
      if (isTwoEquationEqual(equation, searchEquation)) {
        setOfEquation[index] = replaceEquation;
        isReplaceComplete = true;
      }
    });

    if (!isReplaceComplete) {
      setOfEquation.push(replaceEquation);
    }
    if (setOfEquation.length === 1) {
      return;
    }
    const roots = this._calculateSet(setOfEquation);

    this.data.getPointDetails.set(pointId, {
      ...pointDetail,
      setOfEquation,
      roots
    });

    if (roots.length > 0) {
      let coordinate;
      if (dataViewModel.isNeedRandomCoordinate(pointId)) {
        coordinate = roots[getRandomValue(0, roots.length)];
      } else {
        const nodeDirectionInfo = dataViewModel.getData.getPointDirectionMap[pointId];

        if (nodeDirectionInfo) {
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
        } else {
          coordinate = roots[0];
        }
      }
      if (coordinate) {
        dataViewModel.updateCoordinate(pointId, coordinate);
      }
    }
  }

  _updatePointDetails(pointId: string, pointDetails: PointDetailsType) {
    this.data.getPointDetails.set(pointId, {
      setOfEquation: pointDetails.setOfEquation,
      roots: pointDetails.roots,
      exceptedCoordinates: pointDetails.exceptedCoordinates
    });
  }

  uniqueSetOfEquation(equations: any[]): any[] {
    let result = [];

    equations.forEach((equation) => {
      for (let i = 0; i < result.length; i++) {
        if (JSON.stringify(equation) === JSON.stringify(result[i])) return;
      }
      result.push(equation);
    });

    return result;
  }

  executePointDetails(pointId: string, equation: EquationType) {
    let isFirst = false;
    if (!this.data.getPointDetails.has(pointId)) {
      this._updatePointDetails(pointId, {
        setOfEquation: [],
        roots: [],
        exceptedCoordinates: []
      });
    }

    if (this.data.getPointDetails.get(pointId).setOfEquation.length <= 1) {
      let newSetOfEquation = [...this.data.getPointDetails.get(pointId).setOfEquation, equation];
      if (newSetOfEquation.length === 2) {
        if (isTwoEquationEqual(newSetOfEquation[0], newSetOfEquation[1])) {
          newSetOfEquation = newSetOfEquation[0];
        }
      }
      this._updatePointDetails(pointId, {
        setOfEquation: newSetOfEquation,
        roots: this.data.getPointDetails.get(pointId).roots,
        exceptedCoordinates: this.data.getPointDetails.get(pointId).exceptedCoordinates
      });
      isFirst = true;
    }

    if (this.data.getPointDetails.get(pointId).setOfEquation.length === 2) {
      if (isQuadraticEquation(equation) && !isFirst) {
        for (let i = 0; i < 2; i++) {
          if (!isQuadraticEquation(this.data.getPointDetails.get(pointId).setOfEquation[i])) {
            this.data.getPointDetails.get(pointId).setOfEquation[i] = equation;
            break;
          }
        }
      }

      const roots = this._calculateSet(this.data.getPointDetails.get(pointId).setOfEquation);
      const currentRoots = this.data.getPointDetails.get(pointId).roots;

      const finalRoots = typeof roots === 'string' ? currentRoots : currentRoots.concat(roots);
      this._updatePointDetails(pointId, {
        setOfEquation: this.data.getPointDetails.get(pointId).setOfEquation,
        roots: finalRoots,
        exceptedCoordinates: this.data.getPointDetails.get(pointId).exceptedCoordinates
      });
    }

    let temp = this.data.getPointDetails.get(pointId).roots;

    if (typeof temp === 'string') {
      ErrorService.showError('500');
      return;
    }

    temp = temp.filter((root) => {
      if (root.y === Infinity) {
        console.error(temp);
      }
      return isIn(root, equation);
    });

    if (temp.length > 0) {
      // TODO: Add exception
      this._updatePointDetails(pointId, {
        setOfEquation: this.data.getPointDetails.get(pointId).setOfEquation,
        roots: temp,
        exceptedCoordinates: this.data.getPointDetails.get(pointId).exceptedCoordinates
      });

      let coordinate;
      if (dataViewModel.isNeedRandomCoordinate(pointId)) {
        coordinate = temp[getRandomValue(0, temp.length)];
      } else {
        const nodeDirectionInfo = dataViewModel.getData.getPointDirectionMap[pointId];
        if (nodeDirectionInfo) {
          const staticPointCoordinate = dataViewModel.getNodeInPointsMapById(nodeDirectionInfo.root).coordinate;
          if (temp.length > 1) {
            const rootsDirection = temp.map((root) => ({
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
            coordinate = temp[0];
          }
        } else {
          coordinate = temp[0];
        }
      }
      if (coordinate) {
        dataViewModel.updateCoordinate(pointId, coordinate);
      }
    }
  }

  getInformation(string: string): mixed {
    const _string = '_ '.concat(string.concat(' _'));
    let isMatching = false;
    let preProgress = [];
    Object.keys(defineSentences).forEach((key) => {
      defineSentences[key].forEach((sentence) => {
        sentence = '_ '.concat(sentence.concat(' _'));

        if (isMatching) return;
        const value = this.getBasicInformation(_string, sentence, key);
        if (Object.keys(value).length > 0) {
          isMatching = true;
          preProgress = value;
          preProgress['outputType'] = key;
        }
      });
    });
    const type = preProgress.outputType;

    const result = defineInformation(preProgress);
    if (result.Error || !result.outputType) {
      ErrorService.showError('300');
      return;
    }
    if (result.point && result.point.length > 3) {
      ErrorService.showError('301');
      return;
    }

    // add operation for define type
    if (type === 'define') {
      GConst.Others.OPERATIONS.forEach((operation) => {
        if (result.operation) return;
        if (string.includes(operation)) {
          result.operation = operation;
          if (operation === '=' && !result.value) {
            result.value = '1';
            result.operation = '*';
          }
        }
      });
    }
    return result;
  }

  getBasicInformation(string, _defineSentence, type) {
    let others = _defineSentence.match(new RegExp(GConst.Regex.OTHER, 'g'));
    let params = _defineSentence.match(new RegExp(GConst.Regex.KEY, 'g'));

    let result = {};

    params.forEach((key) => {
      result[key] = [];
    });

    for (let i = 0; i < params.length; i++) {
      let start =
        others[i]
          .replace('+', '\\+')
          .replace('-', '\\-')
          .replace('*', '\\*') || '';
      let end =
        others[i + 1]
          .replace('+', '\\+')
          .replace('-', '\\-')
          .replace('*', '\\*') || '';

      let param = string.match(new RegExp(start + '(.*)' + end));

      if (param) result[params[i]].push(param[1]);

      if (i === others.length - 1) {
        let lastParam = string.match(new RegExp(end + '(.*)'));
        if (lastParam) result[params[i + 1]].push(lastParam[1]);
      }
    }

    if (this.getLength(result) === params.length) {
      if (type === 'relation') result[type] = others[1].replace('_', '').trim();
      return result;
    }

    return [];
  }

  getLength(dictionary) {
    let count = 0;
    Object.keys(dictionary).forEach((key) => {
      count += dictionary[key].length;
    });
    return count;
  }

  getCircleEquation(centerId: string): EquationType {
    return this.circlesData[centerId].equation;
  }

  getCircleCenterCoordinate(centerId: string): CoordinateType {
    return this.circlesData[centerId].coordinate;
  }

  isCoordinateDuplicated(coordinate: CoordinateType): boolean {
    const stringifyCoordinate = JSON.stringify(coordinate);
    let result = false;
    this.getData.pointsMap.forEach((node: NodeType) => {
      const key = node.id;
      if (result) {
        return;
      }
      if (JSON.stringify(stringifyCoordinate) === JSON.stringify(this.getNodeInPointsMapById(key).coordinate)) {
        result = true;
      }
    });

    return result;
  }

  analyzeInput() {
    this.circlesData = {};
    const data = this.RelationsInput.map((relationsInput: RelationInputModel): string => relationsInput.value)
      // eslint-disable-next-line no-control-getBasicInformation
      .filter((sentence) => !!sentence)
      .map((sentence: string, index: number) => {
        this.executedInputIndex = index;
        const result = this.getInformation(sentence);
        this.relationsInput[index].status = GConst.InputStatus.SUCCESS;
        this.inputData.push(result);
        return result;
      });

    let result = {
      shapes: [],
      relations: []
    };
    for (let i = 0; i < data.length; i++) {
      let item = data[i];

      if (item.outputType === 'shape') {
        result.shapes.push(item);
      } else {
        result.relations.push(item);
      }
    }

    this.data.setRelationsResult = result;

    this.RelationsInput.forEach((input: RelationInputModel) => {
      input.status = GConst.InputStatus.SUCCESS;
    });
    return analyzeResult(result);
  }
}

const dataViewModel = new DataViewModel(appData);

export default dataViewModel;

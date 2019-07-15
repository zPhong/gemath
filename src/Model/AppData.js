// @flow
import { observable, action } from 'mobx';
import RelationInputModel from './RelationInputModel';
import autobind from 'autobind-decorator';
class AppData {
  @observable
  relationsInput: Array<RelationInputModel>;

  constructor() {
    this.additionSegment = [];
    this.relationsResult = {};
    this.pointsMap = [];
    this.pointsDirectionMap = {};
    this.executedRelations = [];
    this.executedNode = [];
    this.__pointDetails__ = new Map();
    this.relationsInput = [new RelationInputModel()];
  }

  clear() {
    this.relationsResult = [];
    this.pointsMap = [];
    this.executedRelations = [];
    this.executedNode = [];
    this.__pointDetails__.clear();
  }

  get RelationsInput() {
    return this.relationsInput;
  }

  @action
  addNewInput() {
    this.relationsInput.push(new RelationInputModel());
  }

  @action
  removeInput() {
    this.relationsInput.pop();
  }

  get getAdditionSegment() {
    return this.additionSegment;
  }

  get getRelationsResult() {
    return this.relationsResult;
  }

  get getPointsMap() {
    return this.pointsMap;
  }

  set setPointsMap(newPointsMap) {
    this.pointsMap = newPointsMap;
  }

  get getPointDirectionMap() {
    return this.pointsDirectionMap;
  }

  get getExecutedRelations() {
    return this.executedRelations;
  }

  get getExecutedNode() {
    return this.executedNode;
  }

  get getPointDetails() {
    return this.__pointDetails__;
  }
}

const appData = new AppData();

export default appData;

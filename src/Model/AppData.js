// @flow

class AppData {
  constructor() {
    this.additionSegment = [];
    this.relationsResult = {};
    this.pointsMap = [];
    this.pointsDirectionMap = {};
    this.executedRelations = [];
    this.executedNode = [];
    this.__pointDetails__ = new Map();
  }

  clear() {
    this.relationsResult = [];
    this.pointsMap = [];
    this.executedRelations = [];
    this.executedNode = [];
    this.__pointDetails__.clear();
  }

  setRelationsResult(value) {
    this.relationsResult = value;
  }

  get getAdditionSegment() {
    return this.additionSegment;
  }

  get getRelationsResult() {
    return this.relationsResult;
  }

  get getPointsMap() {
    return this.pointsMap
  }

  setPointsMap(newPointsMap) {
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
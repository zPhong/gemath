import { circleType } from '../core/definition/define';
export type CalculatedResultType = number | string;

export type CoordinateType = {
  x: CalculatedResultType,
  y: CalculatedResultType
};

// Ax2 + By2 + Cx + Dy + E = 0
export type EquationType = {
  a: CalculatedResultType,
  b: CalculatedResultType,
  c: CalculatedResultType,
  d: CalculatedResultType,
  e: CalculatedResultType
};

export type NodeRelationType = {
  id: string,
  relation: any
};

export type NodeType = {
  id: string,
  isStatic: boolean,
  coordinate: CoordinateType,
  dependentNodes: Array<NodeRelationType>
};

export type SegmentDataType = { name: string, vector: CoordinateType, length: number };

export type DrawingSegmentType = {
  name: string,
  visible: boolean
};

export type CircleType = {
  center: CoordinateType,
  radius: CalculatedResultType,
  equation: EquationType
};

export type DrawingDataType = {
  points: Array<NodeType>,
  segment: Array<string>,
  circles: CircleType
};

// ax - y + b = 0
export type LineType = {
  a: CalculatedResultType,
  b: CalculatedResultType
};

// u(a,b) | n(a,b)
export type Vector = {
  a: CalculatedResultType,
  b: CalculatedResultType
};

export type PointDetailsType = {
  setOfEquation: Array<EquationType>,
  roots: Array<Object>,
  exceptedCoordinates: Array<CoordinateType>
};

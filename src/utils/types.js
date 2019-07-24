export type CoordinateType = {
  x: number,
  y: number
};

// Ax2 + By2 + Cx + Dy + E = 0
export type EquationType = {
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
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

export type DrawingDataType = {
  points: Array<NodeType>,
  segment: Array<string>
};

// ax - y + b = 0
export type LineType = {
  a: number,
  b: number
};

// u(a,b) | n(a,b)
export type Vector = {
  a: number,
  b: number
};

export type PointDetailsType = {
  setOfEquation: Array<EquationType>,
  roots: Array<Object>,
  exceptedCoordinates: Array<CoordinateType>
};

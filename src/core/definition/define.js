const defineSentences = {
  define: [
    '{object} + {object} = {object}',
    '{object} - {object} = {object}',
    '{object} = {value} * {object}',
    '{object} = {object}',
    '{object} > {object}',
    '{object} < {object}'
  ],
  relation: [
    '{object} song song {object}',
    '{object} vuông góc {object}',
    '{object} cắt {object} tại {arrayPoints}',
    '{object} phân giác ngoài {angle}',
    '{object} phân giác trong {angle}',
    '{object} phân giác {angle}',
    '{arrayPoints} thẳng hàng',
    '{point} trung điểm {segment}',
    '{point} không thuộc {object}',
    '{point} thuộc {object}',
    '{segment} trung tuyến {triangle}',
    '{segment} đường cao {triangle}',
    '{circle} đường kính {segment}',
    '{segment} tiếp tuyến {circle}'
  ],
  shape: [
    'tam giác {type triangle}',
    'tứ giác {quadrilateral}',
    'hình thang {type trapezoid}',
    'hình bình hành {parallelogram}',
    'hình chữ nhật {rectangle}',
    'hình thoi {rhombus}',
    'hình vuông {square}',
    '{object type triangle} tại {escribedPoint}',
    '{object type triangle}'
  ]
};

const shapeList = ['triangle', 'quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'];

const reversedDependentObjRelation = ['vuông góc', 'cắt'];

const RankingObjectContain = [['point'], ['segment', 'ray'], ['angle']];

const objectWithPoint = ['angle', 'segment', 'ray', 'point', 'circle', 'triangle'];

const validate = {
  object: {
    define: ['angle', 'segment'],
    relation: ['ray', 'line', 'segment', 'circle']
  },
  point: { length: 1, format: '1' },
  segment: { length: 2, format: '11' },
  ray: { length: 2, format: '11' },
  line: { length: 1, format: '0' },
  angle: { length: 3 },
  shape: {
    triangle: { length: 3, format: '111' },
    quadrilateral: { length: 4, format: '1111' },
    trapezoid: { length: 4, format: '1111' },
    parallelogram: { length: 4, format: '1111' },
    rectangle: { length: 4, format: '1111' },
    rhombus: { length: 4, format: '1111' },
    square: { length: 4, format: '1111' },
    circle: { length: 1, format: '1' }
  },
  shapeType: {
    triangle: ['', 'vuông', 'cân', 'vuông cân', 'đều', 'nội tiếp', 'ngoại tiếp', 'bàng tiếp'],
    trapezoid: ['', 'vuông', 'cân']
  }
};

/*
    | song song,
    ^ vuông góc,
    = cân
 */
const shapeRules = {
  triangle: {
    right: '10^02', // Ex: AB vuong goc AC
    isosceles: '01=02',
    right_isosceles: '10^02&01=02',
    equilateral: '01=02&01=12&02=12'
  },
  trapezoid: {
    normal: '01|23',
    right: '01|23&10^03',
    isosceles: '01|23&03=12'
  },
  parallelogram: {
    normal: '01|23&03|12'
  },
  rectangle: {
    normal: '01^12&12^23&23^30&30^01'
  },
  rhombus: {
    normal: '02^13'
  },
  square: {
    normal: '01|23&03|12&01^12&12^23&23^03&01=03&&01=12&12=23&&23=03'
  }
};

const mappingShapeType = {
  vuông: 'right',
  cân: 'isosceles',
  'vuông cân': 'right_isosceles',
  đều: 'equilateral',
  'nội tiếp': 'nội tiếp',
  'ngoại tiếp': 'ngoại tiếp',
  'bàng tiếp': 'bàng tiếp'
};

const circleType = ['nội tiếp', 'ngoại tiếp', 'bàng tiếp'];

const TwoStaticPointRequireShape = ['triangle', 'trapezoid', 'rectangle', 'square'];

const ShapeAffectBySegmentChange = ['rhombus', 'trapezoid', 'parallelogram'];

export {
  validate,
  TwoStaticPointRequireShape,
  defineSentences,
  RankingObjectContain,
  objectWithPoint,
  shapeList,
  reversedDependentObjRelation,
  shapeRules,
  mappingShapeType,
  circleType,
  ShapeAffectBySegmentChange
};

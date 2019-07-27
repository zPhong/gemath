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
    '{object} cắt {object} tại {point}',
    '{object} phân giác {angle}',
    '{arrayPoints} thẳng hàng',
    '{point} trung điểm {segment}',
    '{point} không thuộc {object}',
    '{point} thuộc {object}'
  ],
  shape: [
    'tam giác {type triangle}',
    'tứ giác {quadrilateral}',
    'hình thang {type trapezoid}',
    'hình bình hành {parallelogram}',
    'hình chữ nhật {rectangle}',
    'hình thoi {rhombus}',
    'hình vuông {square}',
    'đường tròn tâm {circle}'
  ]
};

const shapeList = ['triangle', 'quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'];

const reversedDependentObjRelation = ['vuông góc', 'cắt'];

const RankingObjectContain = [['point'], ['segment', 'ray'], ['angle']];

const objectWithPoint = ['angle', 'segment', 'ray', 'point'];

const validate = {
  object: {
    define: ['angle', 'segment'],
    relation: ['ray', 'line', 'segment']
  },
  point: { length: 1, format: '1' },
  segment: { length: 2, format: '11' },
  ray: { length: 2, format: '10' },
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
    triangle: ['', 'vuông', 'cân', 'vuông cân', 'đều'],
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
    right: '01^02', // Ex: AB vuong goc AC
    isosceles: '01=02',
    right_isosceles: '01^02&01=02',
    equilateral: '01=02&01=12'
  },
  trapezoid: {
    normal: '01|23',
    right: '01|23&01^03',
    isosceles: '01|23&03=12'
  },
  parallelogram: {
    normal: '01|23&03|12'
  },
  rectangle: {
    normal: '01|23&03|12&01^12&12^23&23^03'
  },
  rhombus: {
    normal: '01|23&03|12&02^13'
  },
  square: {
    normal: '01|23&03|12&01^12&12^23&23^03&01=03&&01=12&12=23'
  }
};

const mappingShapeType = {
  vuông: 'right',
  cân: 'isosceles',
  'vuông cân': 'right_isosceles',
  đều: 'equilateral'
};

const TwoStaticPointRequireShape = ['triangle', 'rhombus', 'rectangle', 'square'];

export {
  validate,
  TwoStaticPointRequireShape,
  defineSentences,
  RankingObjectContain,
  objectWithPoint,
  shapeList,
  reversedDependentObjRelation,
  shapeRules,
  mappingShapeType
};

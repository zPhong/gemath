const Number = Object.freeze({
  MIN_RANDOM_NUMBER: -10,
  MAX_RANDOM_NUMBER: 10,
  MIN_RANDOM_GENERATION: 5,
  MAX_RANDOM_GENERATION: 15,
  NOT_FOUND: 99,
});

const String = Object.freeze({
  INFINITY: 'vô cực',
  IMPOSSIBLE: 'vô nghiệm',
  TOO_SHORT: 'quá ngắn',
  NOT_ENOUGH_SET: 'không đủ phương trình tạo thành hệ',
  NOT_BE_IN_LINE: 'điểm không thuộc đường',
});

const Regex = Object.freeze({
  KEY: '[^{\\}]+(?=})',
  OTHER: '(^([^{]+(?={)))|((?<=})([^{]+)(?={))|(((?<=})[^}]+)$)'
});

const Others = Object.freeze({
  OPERATIONS: ['+', '-', '*', '<', '>', '='],
});

const GConst = {
  Number,
  String,
  Regex,
  Others
};

export default GConst;
export const INPUT_ITEM_STATUS = {
  SUCCESS: 'Success',
  NORMAL: `Normal`,
  ERROR: 'Error'
};
export const WRONG_FORMAT = 'Sai định dạng';
export const MAXIMUM_POINT_ERROR = 'Tối đa 3 điểm thẳng háng';
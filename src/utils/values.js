const Number = Object.freeze({
  MIN_RANDOM_NUMBER: -10,
  MAX_RANDOM_NUMBER: 10,
  MIN_RANDOM_GENERATION: 5,
  MAX_RANDOM_GENERATION: 15,
  NOT_FOUND: 99
});

const String = Object.freeze({
  INFINITY: 'vô cực',
  IMPOSSIBLE: 'vô nghiệm',
  TOO_SHORT: 'quá ngắn',
  NOT_ENOUGH_SET: 'không đủ phương trình tạo thành hệ',
  NOT_BE_IN_LINE: 'điểm không thuộc đường'
});

const Regex = Object.freeze({
  KEY: '[^{\\}]+(?=})',
  OTHER: '(^([^{]+(?={)))|((?<=})([^{]+)(?={))|(((?<=})[^}]+)$)'
});

const Others = Object.freeze({
  OPERATIONS: ['+', '-', '*', '<', '>', '=']
});

const Errors = Object.freeze({
  UNDEFINED_ERROR: 'Lỗi không xác dịnh',
  WRONG_FORMAT: 'Sai định dạng',
  MAXIMUM_POINT_ERROR: 'Tối đa 3 điểm thẳng háng'
});

const InputStatus = Object.freeze({
  SUCCESS: 'Success',
  NORMAL: `Normal`,
  ERROR: 'Error'
});
const TutorialString = {
  STEP_ONE: `
  Danh sách các mẫu câu dặc trưng:
    \n__ = __
    \n__ song song/vuông góc __
    \n__ cắt __ tại __
    \n__ phân giác __
    \n__ thẳng hàng
    \n__ trung điểm __
    \n__ thuộc/không thuộc __
    \n__ tiếp tuyến (__)
    \ntam giác {loại} __
    \ntứ giác __
    \nđường tròn tâm __ ngoại tiếp/nội tiếp __
\nLưu ý:
  \n Đường tròn trong cái mối quan hệ khác sẽ nằm trong ()
  \n  Vd: AB tiếp tuyến (O)
  `
};
const GConst = {
  Number,
  String,
  Regex,
  Others,
  Errors,
  InputStatus,
  TutorialString
};

export default GConst;

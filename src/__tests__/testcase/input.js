import RelationInputModel from '../Model/RelationInputModel';

export const topic = {
  '7': [
    [
      new RelationInputModel('tam giác ABC'),
      new RelationInputModel('AB = 3'),
      new RelationInputModel('AC = 4'),
      new RelationInputModel('BC = 5'),
      new RelationInputModel('AH vuông góc BC'),
      new RelationInputModel('AH = 2.4')
    ],
    [new RelationInputModel('tam giác ABC'), new RelationInputModel('ABC = 45'), new RelationInputModel('BCA = 45')],
    [new RelationInputModel('tam giác cân ABC'), new RelationInputModel('ABC = 45'), new RelationInputModel('AB = 3')],
    [new RelationInputModel('tam giác vuông ABC'), new RelationInputModel('AB = 3'), new RelationInputModel('AC = 5')],
    [new RelationInputModel('tam giác vuông cân ABC'), new RelationInputModel('AB = 3')],
    [new RelationInputModel('tam giác đều ABC'), new RelationInputModel('AB = 3')]
  ],
  '8': [
    [
      new RelationInputModel('tứ giác ABC'),
      new RelationInputModel('ABC = 45'),
      new RelationInputModel('BCD = 43'),
      new RelationInputModel('CDA = 135')
    ],
    [
      new RelationInputModel('tứ giác ABCD'),
      new RelationInputModel('AB = 6'),
      new RelationInputModel('CD = 8'),
      new RelationInputModel('BC = 5')
    ],
    [
      (new RelationInputModel('hình chữ nhật ABCD'), new RelationInputModel('AB = 3'), new RelationInputModel('BC = 5'))
    ],
    [
      new RelationInputModel('hình thang ABCD'),
      new RelationInputModel('AB = 6'),
      new RelationInputModel('BC = 3'),
      new RelationInputModel('CD = 7'),
      new RelationInputModel('AD = 4')
    ],
    [
      new RelationInputModel('hình bình hành ABCD'),
      new RelationInputModel('AB = 6'),
      new RelationInputModel('AC = 7'),
      new RelationInputModel('BD = 9')
    ]
  ],

  '9': [
    [
      new RelationInputModel('tam giác ABC'),
      new RelationInputModel('AD vuông góc BC'),
      new RelationInputModel('BE vuông góc AC'),
      new RelationInputModel('CF vuông góc AB'),
      new RelationInputModel('AD cắt BE tại H'),
      new RelationInputModel('(O) ngoại tiếp ABC'),
      new RelationInputModel('AD cắt (O) tại M'),
      new RelationInputModel('BE cắt (O) tại N'),
      new RelationInputModel('CF cắt (O) tại P')
    ],
    [
      new RelationInputModel('tam giác cân ABC'),
      new RelationInputModel('AD vuông góc BC'),
      new RelationInputModel('BE vuông góc AC'),
      new RelationInputModel('AD cắt BE tại H'),
      new RelationInputModel('(O) ngoại tiếp AHE')
    ],
    [
      new RelationInputModel('tam giác cân ABC'),
      new RelationInputModel('(I) nội tiếp ABC'),
      new RelationInputModel('(K) bàng tiếp ABC tại A'),
      new RelationInputModel('O trung điểm IK'),
      new RelationInputModel('(O) ngoại tiếp BKC')
    ],
    [
      new RelationInputModel('tam giác ABC'),
      new RelationInputModel('ABC = 80'),
      new RelationInputModel('ACB = 40'),
      new RelationInputModel('BD phân giác ABC'),
      new RelationInputModel('CE phân giác ACB'),
      new RelationInputModel('BD cắt CE tại F')
    ]
  ]
};

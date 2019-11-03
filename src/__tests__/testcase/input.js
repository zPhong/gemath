import RelationInputModel from '../Model/RelationInputModel';

export const topic = {
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
    ]
  ]
};

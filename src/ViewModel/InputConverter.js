// @flow
import RelationInputModel from '../Model/RelationInputModel';
import GConst from '../core/config/values.js';

const specializeLanguageMap = {
  'Góc({object})=Góc({object})': '{object} = {object}',
  '{object}={object}': '{object} = {object}',
  '{object} song song {object}': '{object} song song {object}',
  '{object} vuông góc {object}': '{object} vuông góc {object}',
  '{object} cắt {object} tại {arrayPoints}': '{object} cắt {object} tại {arrayPoints}',
  '{arrayPoints} là giao điểm của {object} và {object}': '{object} cắt {object} tại {arrayPoints}',
  '{object} là phân giác ngoài Góc({angle})': '{object} phân giác ngoài {angle}',
  '{object} là phân giác trong Góc({angle})': '{object} phân giác trong {angle}',
  '{object} là phân giác của Góc({angle})': '{object} phân giác {angle}',
  '{arrayPoints} thẳng hàng': '{arrayPoints} thẳng hàng',
  '{point} là trung điểm của {segment}': '{point} trung điểm {segment}',
  '{point} không thuộc {object}': '{point} không thuộc {object}',
  '{point} thuộc {object}': '{point} thuộc {object}',
  '{segment} là trung tuyến {type triangle}': '{segment} trung tuyến {triangle}',
  '{segment} là đường cao của tam giác {triangle}': '{segment} đường cao {triangle}',
  '{circle} đường kính {segment}': '{circle} đường kính {segment}',
  '{segment} là tiếp tuyến {circle}': '{segment} tiếp tuyến {circle}',
  'Cho tam giác {type triangle}': 'tam giác {type triangle}',
  'Cho tứ giác {quadrilateral}': 'tứ giác {quadrilateral}',
  'Cho hình thang {type trapezoid}': 'hình thang {type trapezoid}',
  'Cho hình bình hành {parallelogram}': 'hình bình hành {parallelogram}',
  'Cho hình chữ nhật {rectangle}': 'hình chữ nhật {rectangle}',
  'Cho hình thoi {rhombus}': 'hình thoi {rhombus}',
  'Cho hình vuông {square}': 'hình vuông {square}',
  '{object type triangle} tại {escribedPoint}': '{object type triangle} tại {escribedPoint}',
  '{object type triangle}': '{object type triangle}'
};

function getLength(dictionary) {
  let count = 0;
  Object.keys(dictionary).forEach((key) => {
    count += dictionary[key].length;
  });
  return count;
}

function getInformation(string: string): mixed {
  const defineSentences = Object.keys(specializeLanguageMap);
  const _string = '_ '.concat(string.concat(' _'));
  let isMatching = false;
  let result = '';
  defineSentences.forEach((sentence) => {
    const _sentence = '_ '.concat(sentence.concat(' _'));
    if (isMatching) return;
    const value = getBasicInformation(_string, _sentence);
    if (Object.keys(value).length > 0) {
      const mySentence = classifyData(specializeLanguageMap[sentence], value);
      result = mySentence;
      isMatching = true;
    }
  });

  return result;
}

function getBasicInformation(string, _defineSentence, type = 'define') {
  let others = _defineSentence.match(new RegExp(GConst.Regex.OTHER, 'g'));
  let params = _defineSentence.match(new RegExp(GConst.Regex.KEY, 'g'));
  let result = {};
  params.forEach((key) => {
    result[key] = [];
  });
  for (let i = 0; i < params.length; i++) {
    let start =
      others[i]
        .replace('+', '\\+')
        .replace('-', '\\-')
        .replace('*', '\\*')
        .replace('(', '\\(')
        .replace(')', '\\)') || '';
    let end =
      others[i + 1]
        .replace('+', '\\+')
        .replace('-', '\\-')
        .replace('*', '\\*')
        .replace('(', '\\(')
        .replace(')', '\\)') || '';

    let param = string.match(new RegExp(start + '(.*)' + end));
    if (param) {
      result[params[i]].push(param[1]);
    }
    if (i === others.length - 1) {
      let lastParam = string.match(new RegExp(end + '(.*)'));
      if (lastParam) result[params[i + 1]].push(lastParam[1]);
    }
  }

  if (getLength(result) === params.length) {
    if (type === 'relation') result[type] = others[1].replace('_', '').trim();
    console.log(result);
    return result;
  }

  return [];
}

function classifyData(sentence: string, data) {
  let result = sentence;
  Object.keys(data).forEach((key: string) => {
    data[key].forEach((value: string) => {
      result = result.replace(`{${key}}`, value);
    });
  });
  return result;
}

export function InputConverter(input: string): Array<RelationInputModel> {
  const inputArray = input.split(new RegExp(';', 'g')).map((item: string): string => item.trim());
  inputArray.splice(0, 1);
  inputArray.splice(inputArray.length - 1, 1);
  const convertedInput = inputArray.map((input) => {
    return getInformation(input);
  });

  return convertedInput.map((input: string): RelationInputModel => new RelationInputModel(input));
}

import { isLowerCaseChar, isNumber } from '../../utils/checker';

export function checkFormatString(str) {
  let result = '';
  str.split('').forEach((element) => {
    result += isLowerCaseChar(element);
  });
  return result;
}

function validateObject(str) {
  for (let i = 0; i < str.length; i++) {
    if (isNumber(str[i])) return false;
    if (i > 0) if (str.slice(0, i - 1).includes(str[i])) return false;
  }
  return true;
}

export function defineObject(value) {
  if (isNumber(value)) {
    return 'value';
  }

  if (!validateObject(value)) {
    return undefined;
  }

  if (value.length === 3) {
    return 'angle';
  }

  if (value.includes('(') && value.includes(')') && value.length === 3) {
    return 'circle';
  }

  const formatObj = checkFormatString(value);
  switch (formatObj) {
    case '0':
      return 'line';
    case '1':
      return 'point';
    case '10':
      return 'ray';
    case '11':
      return 'segment';
    default:
      return undefined;
  }
}

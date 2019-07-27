import { RankingObjectContain, validate } from '../../configuration/define';
import { checkFormatString } from '../definition/defineObjType';

export function validateValue(value, type) {
  if (!_validateName(value.value)) return false;

  const validateGeometryType = validate.object[type];
  let validateType;
  if (value.key === 'value' || value.key === 'relation' || value.key === 'undefined') return true;
  if (value.key === 'angle') if (!validateAngle(value.value)) return false;

  if (validateGeometryType.includes(value.key) || value.key !== 'object') {
    const format = checkFormatString(value.value);
    validateType = validate[value.key];
    if (validateType && format)
      if (validateType.format) {
        if (format === validateType.format && value.value.length === validateType.length) return true;
      } else if (value.value.length === validateType.length) {
        return true;
      }
  }
  return false;
}

function validateAngle(value) {
  const format = checkFormatString(value);
  return format[1] === '1';
}

function validateShape(shape) {
  const keys = Object.keys(shape);
  const validateShapeFormat = validate.shape[keys[0]];
  const validateShapeType = validate.shapeType[keys[0]] || [''];
  //check format of shape value
  const value = shape[keys[0]];
  const format = checkFormatString(shape[keys[0]]);
  const shapeFormatCheck = format === validateShapeFormat.format && value.length === validateShapeFormat.length;

  //check type of shape
  const type = shape.type || '';
  const shapeTypeCheck = validateShapeType.includes(type);

  return shapeFormatCheck && shapeTypeCheck && _validateName(shape[keys[0]]);
}

function validateDataRelationship(data) {
  const keys = Object.keys(data);

  for (let indexOfRankingLevel = 0; indexOfRankingLevel < RankingObjectContain.length - 1; indexOfRankingLevel++) {
    for (
      let indexOfObjectCurrentLevel = 0;
      indexOfObjectCurrentLevel < RankingObjectContain[indexOfRankingLevel].length;
      indexOfObjectCurrentLevel++
    ) {
      for (
        let indexOfObjectNextLevel = 0;
        indexOfObjectNextLevel < RankingObjectContain[indexOfRankingLevel + 1].length;
        indexOfObjectNextLevel++
      )
        if (keys.includes(RankingObjectContain[indexOfRankingLevel][indexOfObjectCurrentLevel])) {
          if (data[RankingObjectContain[indexOfRankingLevel + 1][indexOfObjectNextLevel]])
            return checkObjectRelationship(
              data[RankingObjectContain[indexOfRankingLevel][indexOfObjectCurrentLevel]][0],
              data[RankingObjectContain[indexOfRankingLevel + 1][indexOfObjectNextLevel]][0]
            );
        }
    }
  }

  return true;
}

function checkObjectRelationship(obj1, obj2) {
  let check = obj2.split('').map((char) => {
    return obj1.includes(char);
  });
  const result = [...new Set(check)];

  if (result.length === 1) {
    return !result[0];
  }
  if (obj2.length === 2) return check.indexOf(true) === -1;
  if (obj2.length === 3) {
    return !(check.indexOf(true) === 0 || check.indexOf(true) === 2);
  }
}

// check validate name not duplicate Ex: ABB
function _validateName(string) {
  return (
    string.split('').length === string.split('').filter((item, index, array) => array.indexOf(item) === index).length
  );
}

export function validateInformation(info) {
  const type = info.outputType;

  if (type === 'shape') {
    return validateShape(info);
  } else {
    delete info.outputType;
    let keys = Object.keys(info);
    for (let i = 0; i < keys.length; i++) {
      let array = info[keys[i]];
      let key = keys[i];
      for (let j = 0; j < array.length; j++) {
        let value = array[j];
        const check = validateValue({ key, value }, type);

        if (!check) return check;
      }
    }
  }
  const keys = Object.keys(info);
  info.outputType = type;

  if (type === 'define') {
    if (keys.includes('value')) {
      return keys.length === 2;
    } else {
      return keys.length === 1;
    }
  }

  if (type === 'relation') {
    return validateDataRelationship(info);
  }

  return true;
}

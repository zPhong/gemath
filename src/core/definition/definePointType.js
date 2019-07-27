export function definePointType(data) {
  let result = {};

  Object.keys(data).forEach((key) => {
    if (key === 'arrayPoints') {
      result['point'] = data[key].toString().split(',');
    } else {
      result[key] = data[key];
    }
  });

  return result;
}

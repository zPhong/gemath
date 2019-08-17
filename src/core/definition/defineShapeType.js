export function defineShapeType(data) {
  let result = {};

  Object.keys(data).forEach((key) => {
    if (key.includes('type')) {
      const splitter = data[key].toString().split(' ');
      const shape = splitter[splitter.length - 1];
      const splitKey = key.split(' ');
      const shapeName = splitKey.pop();
      const otherData = data[key]
        .toString()
        .replace(shape, '')
        .trim()
        .split(' ');
      result[shapeName] = shape;
      let point = '';
      if (otherData[0].length === 1) {
        result['point'] = otherData[0];
        point = otherData[0];
      }
      result['type'] = otherData
        .join(' ')
        .replace(point, '')
        .trim();
    } else {
      result[key] = data[key].toString();
    }
  });

  return result;
}

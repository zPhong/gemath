export function defineShapeType(data) {
  let result = {};

  Object.keys(data).forEach((key) => {
    if (key.includes('type')) {
      const splitter = data[key].toString().split(' ');
      const shape = splitter[splitter.length - 1];
      const shapeName = key.split(' ').pop();
      result[shapeName] = shape;
      result['type'] = data[key]
        .toString()
        .replace(shape, '')
        .trim();
    } else {
      result[key] = data[key].toString();
    }
  });

  return result;
}

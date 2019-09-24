export default function isValid(value) {
  let r = true;

  if (value === undefined || value === null || value === '') {
    r = false;
  }

  return r;
}
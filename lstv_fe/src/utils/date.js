export function isValidDate(d) {
  const valid = d instanceof Date && !isNaN(d);
  return valid
}
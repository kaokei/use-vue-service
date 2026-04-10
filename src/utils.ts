export function isObject(val: unknown): val is object {
  return val !== null && typeof val === 'object';
}

import { markRaw } from 'vue';

export function isObject(val: unknown): val is object {
  return val !== null && typeof val === 'object';
}

/**
 * 将值标记为 raw（如果是对象则调用 markRaw，否则原样返回）
 */
export function ensureRaw(val: unknown): unknown {
  return isObject(val) ? markRaw(val) : val;
}

import { isObject, ensureRaw } from '@/utils';
import { isReactive, reactive } from 'vue';

describe('isObject', () => {
  it('普通对象返回 true', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('数组返回 true', () => {
    expect(isObject([])).toBe(true);
  });

  it('null 返回 false', () => {
    expect(isObject(null)).toBe(false);
  });

  it('数字返回 false', () => {
    expect(isObject(0)).toBe(false);
    expect(isObject(42)).toBe(false);
  });

  it('字符串返回 false', () => {
    expect(isObject('')).toBe(false);
    expect(isObject('hello')).toBe(false);
  });

  it('布尔值返回 false', () => {
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
  });

  it('undefined 返回 false', () => {
    expect(isObject(undefined)).toBe(false);
  });
});

describe('ensureRaw', () => {
  it('对象值应被 markRaw 标记，不被 reactive 代理', () => {
    const obj = { x: 1 };
    const result = ensureRaw(obj);
    const r = reactive({ nested: result });
    expect(isReactive(r.nested)).toBe(false);
  });

  it('非对象值原样返回', () => {
    expect(ensureRaw(42)).toBe(42);
    expect(ensureRaw('str')).toBe('str');
    expect(ensureRaw(false)).toBe(false);
    expect(ensureRaw(null)).toBeNull();
    expect(ensureRaw(undefined)).toBeUndefined();
  });
});

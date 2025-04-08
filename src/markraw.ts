import { markRaw } from 'vue';
import { defineMetadata, getMetadata } from '@kaokei/di';

const MARK_RAW_KEY = 'KEY_MARK_RAW';

export function MarkRaw(target: any, key: string) {
  const Ctor = target.constructor;
  const meta = getMetadata(MARK_RAW_KEY, Ctor) || {};
  meta[key] = true;
  defineMetadata(MARK_RAW_KEY, meta, Ctor);
}

export function defineMarkRawProperties(instance: any) {
  console.log('defineMarkRawProperties', instance);
  if (instance?.constructor) {
    const Ctor = instance.constructor;
    const meta = getMetadata(MARK_RAW_KEY, Ctor);
    if (meta) {
      const keys = Object.keys(meta);
      console.log('keys', keys);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const symbolKey = Symbol.for(key);
        instance[symbolKey] = markRaw(instance[key]);
        Object.defineProperty(instance, key, {
          configurable: true,
          enumerable: true,
          get() {
            console.log('get', key);
            return this[symbolKey];
          },
          set(value: any) {
            console.log('set', key);
            this[symbolKey] = markRaw(value);
          },
        });
      }
    }
  }
}

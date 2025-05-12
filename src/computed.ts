import { computed, markRaw, reactive } from 'vue';
import { getEffectScope } from './scope.ts';

export function Computed(_: any, key: string, descriptor: PropertyDescriptor) {
  const originalGet = descriptor.get!;
  const originalSet = descriptor.set;

  return {
    configurable: true,
    enumerable: true,
    get<T, S = T>(): T {
      const that: any = reactive(this);
      const sym = Symbol.for(key);
      let computedRefObj = that[sym];
      if (!computedRefObj) {
        const scope = getEffectScope(that);
        const computedRef = scope.run(() => {
          if (originalSet) {
            return computed({
              get: () => originalGet.call(that) as T,
              set: (v: S) => originalSet.call(that, v),
            });
          } else {
            return computed<T>(() => originalGet.call(that));
          }
        });
        computedRefObj = markRaw({ value: computedRef });
        that[sym] = computedRefObj;
      }
      return computedRefObj.value.value;
    },
    set<T>(value: T) {
      const that: any = reactive(this);
      const sym = Symbol.for(key);
      const computedRefObj = that[sym];
      if (computedRefObj && originalSet) {
        computedRefObj.value.value = value;
      }
    },
  } as PropertyDescriptor;
}

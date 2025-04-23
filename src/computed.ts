import { computed, reactive } from 'vue';
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
      let computedRef = that[sym];
      if (!computedRef) {
        const scope = getEffectScope(that);
        computedRef = scope.run(() => {
          if (originalSet) {
            return computed({
              get: () => originalGet.call(that) as T,
              set: (v: S) => originalSet.call(that, v),
            });
          } else {
            return computed<T>(() => originalGet.call(that));
          }
        });
        that[sym] = computedRef;
      }
      return computedRef.value;
    },
    set<T>(value: T) {
      const that: any = reactive(this);
      const sym = Symbol.for(key);
      const computedRef = that[sym];
      if (computedRef && originalSet) {
        computedRef.value = value;
      }
    },
  } as PropertyDescriptor;
}

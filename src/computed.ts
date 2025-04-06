import { computed, reactive } from 'vue';

const map = new WeakMap<object, Map<string, any>>();

export function Computed(
  _target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  const originalGet = descriptor.get!;
  const originalSet = descriptor.set;

  return {
    configurable: true,
    enumerable: true,
    get<T, S = T>() {
      const that = reactive(this);

      if (!map.has(that)) {
        map.set(that, new Map());
      }

      const keyRefMap = map.get(that)!;
      let computedRef = keyRefMap.get(key);

      if (!computedRef) {
        if (originalSet) {
          computedRef = computed({
            get: () => originalGet.call(that) as T,
            set: (v: S) => originalSet.call(that, v),
          });
        } else {
          computedRef = computed<T>(() => originalGet.call(that));
        }
        keyRefMap.set(key, computedRef);
      }

      return computedRef.value;
    },
    set<T>(value: T) {
      const that = reactive(this);
      const computedRef = map.get(that)?.get(key);

      if (computedRef && originalSet) {
        computedRef.value = value;
      }
    },
  } as PropertyDescriptor;
}

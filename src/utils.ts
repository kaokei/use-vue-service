import { proxyRefs, reactive, ref } from 'vue';
import { Injector } from '@kaokei/di';

export function has(obj: any, key: string) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function merge(target: any, source: any) {
  for (const key in source) {
    if (has(source, key)) {
      target[key] = proxyRefs(source[key]);
    }
  }
  return target;
}

export function getInjector(
  provides?: any[],
  parentInjector?: Injector,
  postHook?: any
) {
  postHook =
    postHook ||
    function (service: any) {
      if (service && typeof service === 'object') {
        return reactive(service);
      } else {
        return ref(service);
      }
    };
  return new Injector(provides, parentInjector, postHook);
}

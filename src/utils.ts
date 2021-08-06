import { reactive, ref, proxyRefs } from 'vue';
import { Injector, has } from '@kaokei/di';

function DEFAULT_POST_HOOK(service: any) {
  if (service && typeof service === 'object') {
    return reactive(service);
  } else {
    return ref(service);
  }
}

function DEFAULT_MERGE_HOOK(target: any, source: any) {
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
  options: any = {}
) {
  options.postHook = options.postHook || DEFAULT_POST_HOOK;
  options.mergeHook = options.mergeHook || DEFAULT_MERGE_HOOK;
  return new Injector(provides, parentInjector, options);
}

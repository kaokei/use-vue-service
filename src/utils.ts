import { reactive, ref, proxyRefs } from 'vue';
import { Injector, has } from '@kaokei/di';

function DEFAULT_BEFORE_CACHE_HOOK(service: any) {
  if (service && typeof service === 'object') {
    return reactive(service);
  } else {
    return ref(service);
  }
}

function DEFAULT_MERGE_PROPERTY_HOOK(target: any, source: any) {
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
  options.beforeCacheHook =
    options.beforeCacheHook || DEFAULT_BEFORE_CACHE_HOOK;
  options.mergePropertyHook =
    options.mergePropertyHook || DEFAULT_MERGE_PROPERTY_HOOK;
  return new Injector(provides, parentInjector, options);
}

export function getServiceFromInjector(
  injector: Injector,
  token: any,
  options?: any
) {
  if (Array.isArray(token)) {
    return token.map(t => injector.get(t, options));
  }
  return injector.get(token, options);
}

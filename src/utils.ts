import { reactive, ref } from 'vue';
import { Injector } from '@kaokei/di';

function DEFAULT_POST_HOOK(service: any) {
  if (service && typeof service === 'object') {
    return reactive(service);
  } else {
    return ref(service);
  }
}

export function getInjector(
  provides?: any[],
  parentInjector?: Injector,
  postHook?: any
) {
  return new Injector(provides, parentInjector, postHook || DEFAULT_POST_HOOK);
}

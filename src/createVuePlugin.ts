import { INJECTOR_KEY, DEFAULT_INJECTOR } from './constants';
import { getInjector } from './utils';

export const createVuePlugin = (providers: any = []) => ({
  install: (app: any) => {
    // 需要把DEFAULT_INJECTOR作为父injector
    app.provide(INJECTOR_KEY, getInjector(providers, DEFAULT_INJECTOR));
  },
});

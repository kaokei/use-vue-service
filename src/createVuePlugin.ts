import { INJECTOR_KEY } from './constants';
import { getInjector } from './utils';

export const createVuePlugin = (providers: any = []) => ({
  install: (app: any) => {
    app.provide(INJECTOR_KEY, getInjector(providers));
  },
});

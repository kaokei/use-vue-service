import { useService } from './useService';

import { INJECTOR_KEY } from './constants';

import { DEFAULT_INJECTOR } from './defaultInjector';

import { getInjector } from './utils';

import { Injector } from '@kaokei/di';

type UseServiceType = typeof useService;

type DeclareAppProvidersType = (providers: any[], app: any) => void;

interface InitFn {
  (usFn: UseServiceType, dapFn: DeclareAppProvidersType): void;
}

export function bootstrap(init: InitFn) {
  let appInjector: Injector;

  const declareAppProviders: DeclareAppProvidersType = (
    providers: any[],
    app: any
  ) => {
    appInjector = getInjector(providers, DEFAULT_INJECTOR);
    app.provide(INJECTOR_KEY, appInjector);
  };

  const useAppService: UseServiceType = (Service: any, options?: any) => {
    return useService(Service, options, appInjector || DEFAULT_INJECTOR);
  };

  init(useAppService, declareAppProviders);
}

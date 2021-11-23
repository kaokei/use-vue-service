import { useService } from './useService';
import { DEFAULT_INJECTOR } from './constants';

type UseServiceType = typeof useService;

type DeclareProvidersType = (providers: any[]) => void;

interface InitFn {
  (usFn: UseServiceType, dpFn: DeclareProvidersType): void;
}

export function bootstrap(init: InitFn) {
  const useRootService = (Service: any, options: any) =>
    useService(Service, options, DEFAULT_INJECTOR);

  const declareRootProviders = (providers: any[]) => {
    providers.forEach(provider => DEFAULT_INJECTOR.addProvider(provider));
  };

  init(useRootService, declareRootProviders);
}

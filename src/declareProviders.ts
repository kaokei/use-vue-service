import { provide, inject } from 'vue';
import { ServiceContext, DefaultContext } from './ServiceContext';

export function declareProviders(providers: any[]) {
  const parentCtx = inject(ServiceContext, DefaultContext);
  const newProviders = providers.map(p => {
    if (p.provide) {
      return p;
    } else {
      return {
        provide: p,
        useClass: p,
      };
    }
  });
  const currentCtx = {
    parent: parentCtx,
    providers: newProviders,
  };
  provide(ServiceContext, currentCtx);
}
